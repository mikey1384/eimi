import React from 'react';
import GraphBlock from './GraphBlock';

const quiz = {
  total: [{ name: '전체 시도 횟수', 대상군: 102, 비교대조군: 215 }],
  over10: [
    {
      name: '전체 시도 중 10문제 정답 완료 횟수',
      대상군: 4,
      비교대조군: 19,
      amt: 2400
    }
  ],
  averageFail: [{ name: '평균 탈락 문제 번호', 대상군: 4, 비교대조군: 8 }]
};

const vocab = {
  total: [{ name: '전체 단어 개수', 대상군: 6104, 비교대조군: 7869 }],
  meaningful: [
    {
      name: '유의미한 단어 개수',
      대상군: 2662,
      비교대조군: 6819
    }
  ],
  meaningless: [{ name: '무의미한 단어 개수', 대상군: 3442, 비교대조군: 1050 }]
};

const chess = {
  toEnd: [
    { name: '기권없이 게임을 끝까지 유지한 횟수', 대상군: 37, 비교대조군: 88 }
  ],
  wins: [
    {
      name: '기권없이 유지한 게임 중 승리 횟수',
      대상군: 8,
      비교대조군: 21
    }
  ],
  resign: [{ name: '기권 횟수', 대상군: 54, 비교대조군: 19 }],
  time: [{ name: '세션 유지 평균 시간', 대상군: 223000, 비교대조군: 911000 }]
};

export default function Dashboard() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      <GraphBlock
        title={`1) 문법퀴즈 (총 10문제 중 오답시 바로 탈락, 10문제 연이어 정답을 맞춰야 완료 가능)`}
        graphs={[
          { data: quiz.total },
          { data: quiz.over10 },
          { data: quiz.averageFail }
        ]}
      />
      <GraphBlock
        title={`2) 영어단어수집 `}
        graphs={[
          { data: vocab.total },
          { data: vocab.meaningful },
          { data: vocab.meaningless }
        ]}
      />
      <GraphBlock
        title={`3) 체스`}
        chartWidth={300}
        graphs={[
          { data: chess.toEnd },
          { data: chess.wins },
          { data: chess.resign },
          { data: chess.time, type: 'time' }
        ]}
      />
    </div>
  );
}
