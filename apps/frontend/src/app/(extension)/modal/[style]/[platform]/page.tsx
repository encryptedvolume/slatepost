'use client';

import { StandaloneModal } from '@gitroom/frontend/components/standalone-modal/standalone.modal';
export default function Modal() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas">
      <div className="text-textColor h-[calc(100vh+80px)] w-[calc(100vw+80px)] -m-[32px]">
        <StandaloneModal />
      </div>
    </div>
  );
}
