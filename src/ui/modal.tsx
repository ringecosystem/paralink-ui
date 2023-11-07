import Image from "next/image";
import { PropsWithChildren, ReactElement, useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";
import Button from "./button";

interface Props {
  isOpen: boolean;
  title: string;
  subTitle?: ReactElement | string;
  cancelText?: string;
  okText?: string;
  maskClosable?: boolean;
  className?: string;
  disabledCancel?: boolean;
  disabledOk?: boolean;
  busy?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
}

export default function Modal({
  title,
  subTitle,
  isOpen,
  maskClosable,
  children,
  cancelText,
  okText,
  className,
  disabledCancel,
  disabledOk,
  busy,
  onClose = () => undefined,
  onCancel,
  onOk,
}: PropsWithChildren<Props>) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return createPortal(
    <CSSTransition
      in={isOpen}
      timeout={150}
      nodeRef={nodeRef}
      classNames="modal-fade"
      unmountOnExit
      onEnter={() => {
        document.body.style.overflow = "hidden";
      }}
      onExited={() => {
        document.body.style.overflow = "auto";
      }}
    >
      {/* mask */}
      <div
        ref={nodeRef}
        onClick={(e) => {
          e.stopPropagation();
          maskClosable && onClose();
        }}
        className="fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center bg-app-black/80 p-middle"
      >
        {/* modal */}
        <div
          className={`border-radius relative flex flex-col gap-5 bg-component p-middle lg:p-7 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* close icon */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-transparent p-[2px] transition hover:scale-105 hover:bg-white/10 active:scale-95"
          >
            <Image width={20} height={20} alt="Close" src="/images/close-white.svg" />
          </button>

          {/* header */}
          <div className="flex flex-col gap-middle lg:gap-5">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {subTitle ? (
              typeof subTitle === "string" ? (
                <h5 className="text-base font-normal text-white">{subTitle}</h5>
              ) : (
                subTitle
              )
            ) : null}
          </div>

          <div className="h-[1px] bg-white/10" />

          {/* body */}
          {children}

          {/* footer */}
          {(onCancel || onOk) && (
            <>
              <div className="h-[1px] bg-white/10" />

              <div className="flex items-center justify-between gap-5">
                {onCancel && (
                  <Button kind="default" onClick={onCancel} disabled={disabledCancel} className="button flex-1">
                    {cancelText || "Cancel"}
                  </Button>
                )}
                {onOk && (
                  <Button kind="primary" onClick={onOk} disabled={disabledOk} busy={busy} className="button flex-1">
                    {okText || "Ok"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
