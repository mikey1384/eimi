/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import moment from 'moment';

GraphBlock.propTypes = {
  title: PropTypes.string,
  graphs: PropTypes.array.isRequired
};

export default function GraphBlock({ title, graphs }) {
  // eslint-disable-next-line react/prop-types
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>세션 유지 평균 시간</div>
          <p
            className="label"
            style={{ color: '#8884d8', marginBottom: '0.5rem' }}
          >{`비교대조군 : ${moment(payload[0]?.value).format('mm:ss')}`}</p>
          <p className="label" style={{ color: '#82ca9d' }}>{`대상군 : ${moment(
            payload[1]?.value
          ).format('mm:ss')}`}</p>
        </div>
      );
    }
    return null;
  };
  return (
    <div style={{ marginTop: '5rem' }}>
      <h2>{title}</h2>
      <div
        style={{
          display: 'flex',
          marginTop: '3rem',
          justifyContent: 'center'
        }}
      >
        {graphs.map((graph, index) => (
          <BarChart
            key={index}
            width={250}
            height={300}
            data={graph.data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis
              type="number"
              tickFormatter={
                graph.type === 'time'
                  ? (unixTime) => moment(unixTime).format('mm:ss')
                  : null
              }
            />
            <Tooltip
              {...(graph.type === 'time' ? { content: <CustomTooltip /> } : {})}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="비교대조군" fill="#8884d8" />
            <Bar dataKey="대상군" fill="#82ca9d" />
          </BarChart>
        ))}
      </div>
    </div>
  );
}
