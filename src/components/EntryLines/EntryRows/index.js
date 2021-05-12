/**
 * @ Author: 梁洪刚
 * @ Create Time: 2021-04-15 10:40:14
 * @ Description: 可以在一行内渲染多个Input、Select、字符、甚至自定义dom，并渲染多个行的组件，
 * @ Instructions:  [设计]数据驱动：行数 = 数组length行数； 行内某dom的显隐 = 相应元素值存在与否（undefined则不显示，null则显示空值）
 *                  [流程]函数调用链：renderRow -> renderCol -> renderUnit
 *                  [目录]33～125：数据相关函数，分为‘查询数据(32~88)’、'操作数据(89~124)'两部分
 *                  [目录]127～339：渲染相关函数，分为‘行、列、最小单元'三部分
 */

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Row, Col, Input, InputNumber, Select } from 'antd';
import { get, set, unset, isEqual, cloneDeep } from 'lodash';
import './index.less';

const { Option } = Select;

import operateApi from './operateApi'; // 利用ref向外传递的方法

const noCallbackTip = () => {
    console.warn("[EntryRows] Data has been changed, but the callback function 'onDataChange()' is not found.");
};

const EntryRows = (props, ref) => {
    const { data, columns, disabled, onDataChange = onDataChange || noCallbackTip } = props;

    const entryRowsRef = useRef();

    useImperativeHandle(ref, () => ({
        operate: operateApi(props)
    }));

    // # 数据Func     1.除了更新组件内部的值以外，还负责向外传递更新后的data，2.此组件中，on开头的函数均可以理解为handleXXX
    // ## 获取
    // 获取被操纵的路径字符串
    const getPathStr = (_idxArr, _dataIdxArr) => {
        let idxArr = cloneDeep(_idxArr);
        let dataIdxArr = cloneDeep(_dataIdxArr);

        const brackets = (num) => { // 加括号：[]
            return '[' + num + ']';
        };

        const cross = () => { // 将数组交叉结合
            let pathArr = [];
            pathArr.push(brackets(idxArr[0])); // idxArr[0]

            dataIdxArr.map((dataIdx, index) => {
                const idx = idxArr[index + 1]; // idxArr[1]...
                const idxStr = idx || idx === 0
                    ? brackets(idx)
                    : '';
                pathArr.push(dataIdx + idxStr);
            });
            return pathArr; // eg. [ "[0]", "ruleList[0]", "calculateType" ]
        };

        return cross().join('.'); // eg. "[0].ruleList[0].calculateType"
    };

    // 获取其父级路径字符串, 若找至最顶级，则会返回最顶级的path，不会继续寻找
    const getParentPathStr = (num, type, unitPath) => { // type: "source" || "parent"，区别如：1），2）, num: 向上寻找的层级
        const reg1 = /\.[a-zA-Z]+$/;
        const reg2 = /\[[0-9]+\]$/;
        let source;
        let parent;
        const current = unitPath; // 0) eg. "[0].ruleList[0].calculateType"

        const cutOff = (num, cur) => {
            num && (source = cur.replace(reg1, '')); // 1）eg."[0].ruleList[0]"
            num && (parent = source.replace(reg2, '')); // 2）eg."[0].ruleList"
            num--;

            !parent && (num = 0); // 若parent="", 则已找至最外层

            return num > 0 // 中断迭代的两种情况：1.迭代至num逐降为0  2.已至最外层，num直接降为0
                ? cutOff(num, parent)
                : {
                    parent, source
                };
        };

        const res = cutOff(num, current);
        return (
            type === 'parent' && res.parent ||
            type === 'source' && res.source
        );
    };

    // ## 操作
    // 查询，并返回，（直接从data中查询
    const onGet = (path) => {
        return get(data, path, data); // 参数3 path解析为undefine时则返回data
    };

    // 更新，并更新data
    const onChange = (val, path) => {
        const target = onGet(path);
        !isEqual(target, val) && // 值不同时才触发外部的onDataChange，避免不停触发onDataChange陷入死循环
            (path // 若无path说明data本身被改变，传入的val即新data
                ? set(data, path, val) && onDataChange(data)
                : onDataChange(val));
    };

    // 删除，并更新data
    const onDelete = (unitPath) => {
        const unit = onGet(unitPath);
        let par = getParent(1, unitPath);
        const parPath = getParentPathStr(1, 'parent', unitPath);

        const onArrayDelete = () => {
            par = par.filter(x => x);
            onChange(par, parPath);
        };

        // 若unset对象是数组，直接使用unset造成会empty slots（元素去除后，数组长度不变）, 遂使用进行附加操作：
        unit && unset(data, unitPath) &&
            par?.length && onArrayDelete();
    };

    // 获取父级，并返回
    const getParent = (num, unitPath) => { // num： 向上寻找的层级，函数getSource同理
        const path = getParentPathStr(num, 'parent', unitPath);
        return onGet(path);
    };

    // # 渲染器Func
    // 渲染器：渲染最小单位，一个 Input 或一个 Select 甚至是一个字符，等等
    const renderUnit = (src, record, column, idxArr, dataIdxArr) => { // 说明：

        /*
            src         当前unit值元素所在的对象/数组
            record      data数组中的元素
            column      定义渲染结构的列表
            idxArr      以array传递所有index，与dataIdxArr共同形成坐标
            dataIdxArr  以array传递所有dataIndex，与idxArr共同形成坐标
        */

        const { type, dataIndex, options, render, operateRender, visible = visible || true } = column;

        const unitPath = getPathStr(idxArr, dataIdxArr);

        let text = onGet(unitPath);

        // 传参
        const eProps = { // 参数1为event
            disabled: disabled,
            value: text,
            onChange: (e) => onChange(e.target.value, unitPath)
        };
        const vProps = { // 参数1直接为value
            disabled: disabled,
            value: text,
            onChange: (val) => onChange(val, unitPath)
        };

        let Opts = []; // Select.Option
        options?.forEach(opt => {
            Opts.push(<Option value={opt.value}>{opt.title}</Option>);
        });

        const defaultRender = () => { // 预设的ReactNode
            switch (type) {
                case 'input': return <Input {...eProps} />;
                case 'inputNumber': return <InputNumber {...vProps} />;
                case 'select': return <Select {...vProps}>{Opts}</Select>;
            }
        };

        const invisibleRender = () => { // 不可见ReactNode，用于保持布局
            // 1.visibility: hidden; 不可见且不影响布局
            // 2.ant-input类名赋予其和其他输入框一样的样式，保证正确的占位大小
            return <div className="invisible ant-input"></div>;
        };

        const clkCallback = (operate, attach) => { // 操作数据的回调函数，暴露给外部以供添加或删除一行（但不一定是整个row，在一个row中有多行时，删除row中的一行）
            const parent = getParent(1, unitPath);
            const parPath = getParentPathStr(1, 'parent', unitPath);

            const isLast = () => { // 如果是内含中的最后一条，则连父级一同删除
                return parent.length === 1;
            };

            const creLineEmptyData = () => { // 非顶级空数据
                let lData = {};
                let lDataIdx = [];

                columns.map(res => { // **此处取的columns是最外层props的，而非renderUnit()中的column!！**
                    res.columns && res.columns.map(r => {
                        r.dataIndex && lDataIdx.push(r.dataIndex);
                    });
                });

                lDataIdx.map(dataIdx => { lData[dataIdx] = null; });

                return lData; // eg. lData:{label:null,calculateType:null}
            };

            const creRowEmptyData = (insert) => { // 顶级空数据，即data中的一条record
                let record = {};

                const lineDataObj = creLineEmptyData();

                columns.map(res => {
                    res.dataIndex && res.columns &&
                        (
                            record[res.dataIndex] = [lineDataObj] // eg. [lineData]:[{label:null,calculateType:null}]
                        );
                    res.dataIndex && !res.columns &&
                        (
                            record[res.dataIndex] = null
                        );
                });

                Object.assign(record, insert);

                return record;
            };

            const onAddLine = () => { // 自动生成空数据，添加到某个非最顶级的数组内
                let _par = cloneDeep(parent); // 保护原数组不被splice改变
                let index = idxArr[idxArr.length - 1] + 1; // 插入的位置索引，在当前位置的下一位
                const lineData = creLineEmptyData();
                _par.splice(index, 0, lineData);
                onChange(_par, parPath);
            };

            const onAddRow = (insert = attach) => { // 自动生成的空数据里，插入接收的attach
                const record = creRowEmptyData(insert);
                let _data = data.concat([record]);
                onChange(_data);
            };

            const onAddMyRow = (wholeRecord = attach) => { // 不自动生成空数据，直接接收用户定义好的空数据
                let _data = data.concat([wholeRecord]);
                onChange(_data);
            };

            const onDeleteLine = () => {
                const parSrcPath = getParentPathStr(2, 'source', unitPath);
                const srcPath = getParentPathStr(1, 'source', unitPath);
                isLast()
                    ? onDelete(parSrcPath) // 1.若为最后一条：则连父级一起删除；
                    : onDelete(srcPath); // 2.非最后一条，则仅删除当前（其值实际上等同于renderUnit传的参数1：record）
            };

            const onDeleteAll = () => {
                console.log('clear');
                onDataChange([]);
            };

            switch (operate) {
                case 'addLine': return onAddLine;
                case 'addRow': return onAddRow;
                case 'addMyRow': return onAddMyRow;
                case 'delete': return onDeleteLine;
                case 'clear': return onDeleteAll;
            }
        };

        const isShow = () => { // 显示与否，返回boolean
            return (
                typeof visible === 'function'
                    ? visible(src, record)
                    : visible
            );
        };

        const beforeGetNode = () => { // 根据是否需要显示(根据传入的visible)，填充null(空值)，或删除值
            return isShow()
                ? text === undefined && onChange(null, unitPath) // 需要显示，但text已undefined时，填充null
                : onDelete(unitPath); // 不需显示，从数据中删除值
        };

        const getNode = () => {
            if (!isShow()) return invisibleRender(); // 0.是否显示
            if (text === undefined && !operateRender && !render) return invisibleRender(); // 1.值为undefined时隐藏，null时仍可显示
            if (typeof operateRender === 'function') return operateRender(record, clkCallback); // 2.若为操作类型render，传入事件回调clkCallback()
            if (render) { // 3.优先使用外部传入的render
                return (
                    typeof render === 'function' // 3.1 回调函数类型
                        ? !dataIndex // 3.1.1 支持两种传参格式
                            ? render(record)
                            : render(text, record)
                        : render // 3.2 ReactNode类型
                );
            } else {
                return defaultRender(); // 4.其次渲染预设的ReactNode
            };
        };

        beforeGetNode(); // -1.渲染前
        const node = getNode(); // 返回Node
        return node;
    };

    // 渲染器：渲染每一个Col，（在此处支持了读取多层级数据的需求
    const renderCol = (record, column, idxArr) => {
        const { columns, dataIndex } = column; // columns： undefined || array

        // *最终传给renderUnit()的参数1的rec(obj)，必须是一个能利用参数2的col(obj)中的dataIndex(str)直接解析到的真实rec
        const recordArr = column && get(record, dataIndex); // *这里的dataIndex不会传入，与参数2的col(obj)中的dataIndex并不相同

        return (
            columns // 从column中解析到的内含的columns，若存在，说明企图读取array结构的数据，遂：
                ? columns.map(col => { // 1.内含的columns本身是个array，
                    return <Col span={col.colSpan}>
                        {
                            recordArr.map((rec, recIdx) => { // 2.如*所说，record并非最终能够被内含col中的dataIndex直接映射的object，遂通过外部的dataIndex先解析到真实的能给被映射的
                                return renderUnit(rec, record, col, [...idxArr, recIdx], [dataIndex, col.dataIndex]);
                            })
                        }
                    </Col>;
                })
                : <Col span={column.colSpan}>
                    {
                        renderUnit(record, record, column, [...idxArr], [column.dataIndex])
                    }
                </Col> // 反之，若column为undefine，即column中不内含内层columns，record就是最终要获得的object，则直接以object结构的column渲染
        );
    };

    // 渲染器：渲染每一个Row
    const renderRow = (record, idxArr) => {
        return (
            <Row
                type="flex"
                justify="center"
                // align="middle"
                wrap={false}
                gutter={8}
            >
                {
                    columns?.length && columns.map(column => {
                        return renderCol(record, column, [...idxArr]); // 以array传递所有index，用于定位并修改、删除值
                    })
                }
            </Row>
        );
    };

    // #渲染器：组件
    return <>
        <div className="com-entry-rows" ref={entryRowsRef}>
            {
                data?.length && data.map((record, rowIdx) => {
                    return renderRow(record, [rowIdx]);
                }) || null
            }
        </div>
    </>;
};

export default forwardRef(EntryRows);
