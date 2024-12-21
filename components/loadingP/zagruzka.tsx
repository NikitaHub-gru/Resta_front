// zagruzka.tsx
import { styled, keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const LoadingText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 45px;
  font-weight: bold;
  color: white;
  
  span {
    display: inline-block;
    animation: ${bounce} 1s ease infinite;
  }

  span:nth-child(2) { animation-delay: 0.1s; }
  span:nth-child(3) { animation-delay: 0.2s; }
  span:nth-child(4) { animation-delay: 0.3s; }
  span:nth-child(5) { animation-delay: 0.4s; }
  span:nth-child(6) { animation-delay: 0.5s; }
  span:nth-child(7) { animation-delay: 0.6s; }
  span:nth-child(8) { animation-delay: 0.7s; }
  span:nth-child(9) { animation-delay: 0.8s; }
  span:nth-child(10) { animation-delay: 0.9s; }
`;

export default function Zagruzka() {
  return (
    <LoadingText>
      <span>З</span>
      <span>а</span>
      <span>г</span>
      <span>р</span>
      <span>у</span>
      <span>з</span>
      <span>к</span>
      <span>а</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </LoadingText>
  );
}
