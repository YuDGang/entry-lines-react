/**
 * @ Author: 梁洪刚
 * @ Create Time: 2021-04-15 20:34:20
 * @ Description: 经过扩展的EntryRows，增加footer
 */

import { useState, useRef } from 'react';
import EntryRows from './EntryRows';
import './index.less';

export default (props) => {
    const { columns, _data = data, footer, disabled, onDataChange } = props;

    const [data, setData] = useState(_data);

    const entryRowsRef = useRef();

    // 确保触发更新，当data发生了改变，及时传回EntryRows.props，避免因state浅比较带来的问题
    const updateData = (data) => {
        const cp = [...data];
        setData(cp);
        onDataChange(cp);
    };

    return <>
        <EntryRows
            columns={columns}
            data={data}
            disabled={disabled}
            onDataChange={updateData}
            ref={entryRowsRef}
        />
        {
            footer &&
            <div className='entry-footer'>
                {footer(entryRowsRef)}
            </div>
        }
    </>;
};
