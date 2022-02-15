import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const total = [
  { name: '전체 시도 횟수', 대상군: 102, 비교대조군: 215, amt: 2400 }
];

const over10 = [
  {
    name: '전체 시도 중 10문제 정답 완료 횟수',
    대상군: 4,
    비교대조군: 19,
    amt: 2400
  }
];

const averageFail = [
  { name: '평균 탈락 문제 번호', 대상군: 4, 비교대조군: 8, amt: 2400 }
];

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ marginTop: '5rem' }}>
        <h2>{`1) 문법퀴즈 (총 10문제 중 오답시 바로 탈락, 10문제 연이어 정답을 맞춰야 완료 가능)`}</h2>
        <div
          style={{
            display: 'flex',
            marginTop: '3rem',
            justifyContent: 'center'
          }}
        >
          <BarChart
            width={250}
            height={300}
            data={total}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis type="number" />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="비교대조군" fill="#8884d8" />
            <Bar dataKey="대상군" fill="#82ca9d" />
          </BarChart>
          <BarChart
            width={250}
            height={300}
            data={over10}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis type="number" />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="비교대조군" fill="#8884d8" />
            <Bar dataKey="대상군" fill="#82ca9d" />
          </BarChart>
          <BarChart
            width={250}
            height={300}
            data={averageFail}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis type="number" />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="비교대조군" fill="#8884d8" />
            <Bar dataKey="대상군" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
