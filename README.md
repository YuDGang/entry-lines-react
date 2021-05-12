# EntryLines 多行数据录入

以数据驱动的、可以在一行内渲染多个(Antd3)Input、Select、字符、甚至自定义dom，并渲染多个上述行的组件
        
## 安装、发布与源码
安装：`npm i @tntx/entry-lines`  
发布：https://www.npmjs.com/package/@tntx/entry-lines  
源码：https://github.com/YuDGang/entry-lines-react/tree/master/src/components/entry-lines

## 更新日志
- 1.0.0 数据驱动的EntryLines发布;  

## API  
|      参数         |       说明          |    类型        |
|      ----         |        ----         |      ----      |
|columns|EntryLines的配置描述，具体项见下表|ColumnProps[]|
|data|数据数组|any[]|
|disabled|数据框的禁用状态|boolean|
|onDataChange|数据改变时触发的回调，参数1为完整的data，`请确保此函数正确的改变了data，以保证组件及时更新`|Function(data)|
|footer|底部额外的Node|ReactNode(operateCallback)|

#### Columns
|      参数         |       说明          |    类型        |
|      ----         |        ----         |      ----      |
|type|输入控件的类型，可选`'input'`、`'inputNumber'`、`'select'`|string|
|dataIndex|输入控件数据在数据项中对应的 key|string|
|visible|可见性|boolean &#124; Function(source, record))|
|render|自定义渲染Node|ReactNode|
|operateRender|操作类型的自定义渲染Node，参数中附带了对数据的操作回调|ReactNode(record, operateCallback)|
|colSpan|栅格占位格数, 共24格|number|
|options|Select.Option控件的选项数组，当`type`为`select`时，此为必填项|array[{title: , value: }]|
    
## 何时使用  
需要渲染每一行由可以互相联动的输入框、字符等并排构成，且同时存在多个类似的多个行时。
        
## 如何使用  
由数据驱动，data改变，则组件重新渲染。
        
## 代码演示
``` javascript
import { useState } from 'react';
import { Modal, Icon } from 'antd';
import EntryRows from '@/components/EntryRows';
import './index.less';

export default () => {
	const [visible, setVisible] = useState(true);
	const [data, setData] = useState([]);
	const disabled = false;

	const onDataChange = (data) => { setData(data); };

	// Entry Rows configs
	const colOneOpts = [
		{ title: '且', value: '&&' },
		{ title: '或', value: '||' }
	];

	const labelOpts = [
		{ title: '选项1', value: 'colTwo1' },
		{ title: '选项2', value: 'colTwo2' },
		{ title: '选项3', value: 'colTwo3' }
	];

	const columns = [
		{
			type: 'select',
			dataIndex: 'colOne',
			options: colOneOpts,
			colSpan: 5,
			visible: (record) => record.lineType === 'group'
		},
		{
			dataIndex: 'colArr',
			columns: [
				{
					type: 'select',
					dataIndex: 'colTwo',
					options: labelOpts,
					colSpan: 5
				},
				{
					dataIndex: 'colThree',
					colSpan: 2,
					render: () => <p>字符</p>
				},
				{
					type: 'inputNumber',
					dataIndex: 'colFour',
					colSpan: 5
				},

				{
					type: 'input',
					dataIndex: 'colFive',
					colSpan: 5,
					visible: (source) => !['empty', 'notEmpty'].find(type => type === source.colTree)
				},
				{
					colSpan: 2,
					operateRender: (record, callback) => {
						return !disabled &&
							<div class="entry-inline-buttons">
								{
									record.lineType === 'group' &&
									<Icon type="plus-circle" onClick={callback('addLine')} />
								}
								<Icon type="delete" onClick={callback('delete')} />
							</div>;
					}
				}
			]
		}
	];

	return <div className="box">
		<a className='box-a-tag' onClick={() => setVisible(!visible)} children={'click to show modal'} />
		<Modal
			className='box-modal'
			width={680}
			visible={visible}
			onCancel={() => setVisible(!visible)}
			onOk={() => console.log(data)}
		>
			<EntryRows
				columns={columns}
				data={data}
				disabled={disabled}
				onDataChange={onDataChange}
				footer={(operateRef) => {
					return <>
						<a onClick={() => operateRef.current.operate('addRow', { lineType: 'single' })}>添加单条条件</a>
						<a onClick={() => operateRef.current.operate('addRow', { lineType: 'group' })}>添加条件组</a>
						<a onClick={() => operateRef.current.operate('clear')}>清空</a>
					</>;
				}}
			/>
		</Modal>
	</div >;
};

```
