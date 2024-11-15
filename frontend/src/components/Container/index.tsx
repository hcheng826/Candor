import styled from "@emotion/styled";

const StyledContainer = styled.div`
  position: relative;
  background-color: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  > span {
    display: block;
    width: 100%;
    height: 100%;
    background-color: black;
    position: absolute;
    right: -4%;
    bottom: -5%;
    z-index: 0;
  }
  > div {
    z-index: 1;
    background-color: white;
    position: relative;
    border-radius: 8px;
    padding: 1.5rem 1rem;
    background-color: white;
    flex: 1 1 0;
  }
`;

export const ShadowedContainer = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <StyledContainer {...props}>
      <div className="w-full h-full">{children}</div>
      <span></span>
    </StyledContainer>
  );
};
