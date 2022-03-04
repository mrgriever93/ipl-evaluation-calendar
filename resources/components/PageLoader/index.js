import React from "react";
import styled, { keyframes } from "styled-components";

const motion = keyframes`
    0% {
        transform: translateX(0) scale(1);
    }
    25%{
        transform: translateX(-50px) scale(0.5);
    }
    50%{
        transform: translateX(0) scale(1);

    }
    75%{
        transform: translateX(50px) scale(0.5);
    }
    100% {
        transform: translateX(0) scale(1);
    }
    `;

const Ball = styled.div`
  width: 40px;
  height: 40px;
  background-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: ${motion} 3s cubic-bezier(0.76, 0, 0.24, 1) infinite;
`;

const LoadingText = styled.div`
  font-weight: bold;
`;

const Spinner = styled.div`
  width: 200px;
  height: 50px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  background-color: rgba(100, 100, 100, 1);
  top: 0;
  left: 0;
  z-index: 999;
`;

const PageLoader = () => {
  return (
    <Wrapper>
      <Spinner>
        <Ball />
        <LoadingText>Loading...</LoadingText>
      </Spinner>
    </Wrapper>
  );
};

export default PageLoader;
