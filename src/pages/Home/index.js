import { useState } from 'react';
import { Modal, Icon } from 'antd';
import EntryLines from '@/components/EntryLines';
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
			<EntryLines
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
