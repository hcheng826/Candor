import styled from "@emotion/styled";
import { cx } from "@emotion/css";
import { Button, ButtonProps } from "../ui/button";

const StyledContainer = styled.div`
  > span {
    display: block;
    width: 100%;
    height: 100%;
    background-color: black;
    position: absolute;
    right: -4%;
    bottom: -20%;
    z-index: 0;
  }
`;
const StyledButton = styled(Button)`
  position: relative;
  transition: all 0.3s ease;
  z-index: 1;

  &:hover {
    transform: translate(5px, 5px);
    filter: brightness(0.9);
  }

  &:disabled {
    opacity: 0.5;
    transform: translate(0, 0);
    filter: brightness(0.8);
  }

  &:active {
    filter: brightness(0.8);
  }
`;

export const PrimaryButton = ({
  children,
  className,
  disableShadow,
  isLoading,
  ...props
}: ButtonProps & { disableShadow?: boolean; isLoading?: boolean }) => {
  return (
    <StyledContainer className="relative">
      <StyledButton
        className={cx("py-4 px-6 text-md", className)}
        color="white"
        loading={isLoading}
        {...props}
      >
        {children}
      </StyledButton>
      {!disableShadow && <span></span>}
    </StyledContainer>
  );
};

export const SecondaryButton = ({
  children,
  className,
  disableShadow,
  isLoading,
  ...props
}: ButtonProps & { disableShadow?: boolean; isLoading?: boolean }) => {
  return (
    <StyledContainer className="relative">
      <StyledButton
        className={cx("py-4 px-6 text-md", className)}
        background={"white"}
        color="primary"
        loading={isLoading}
        {...props}
      >
        {children}
      </StyledButton>
      {!disableShadow && <span></span>}
    </StyledContainer>
  );
};
