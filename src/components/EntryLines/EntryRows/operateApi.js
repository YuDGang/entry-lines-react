import { get, set, isEqual } from 'lodash';

const operateApi = props => {

    const { data = data || [], columns, onDataChange } = props;
    // # 数据操作
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

    // # 对外暴露的回调
    const clickCallback = (operate, attach) => { // 操作数据的回调函数，暴露给外部以供添加或删除一行（但不一定是整个row，在一个row中有多行时，删除row中的一行）
        const creLineEmptyData = () => {
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

        const creRowEmptyData = (attach) => {
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

            Object.assign(record, attach);

            return record;
        };

        // onAddRow() 和 onAddMyRow() 的区别：
        const onAddRow = (insert = attach) => { // 自动生成的空数据里，插入接收的attach
            const record = creRowEmptyData(insert);
            let _data = data.concat([record]);
            onChange(_data);
        };

        const onAddMyRow = (wholeRecord = attach) => { // 不自动生成空数据，直接接收用户定义好的空数据
            let _data = data.concat([wholeRecord]);
            onChange(_data);
        };

        const onDeleteAll = () => {
            onChange([]);
        };

        switch (operate) {
            case 'addRow': onAddRow(); break;
            case 'addMyRow': onAddMyRow(); break;
            case 'clear': onDeleteAll(); break;
        }
    };

    return clickCallback;
};

export default operateApi;
