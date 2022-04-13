/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onRootFrameRenderInjectionToken } from "../on-root-frame-render-injection-token";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import { runInAction } from "mobx";

const flagRendererAsLoaded = getInjectable({
  id: "flag-renderer-as-loaded",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

    return {
      run: () => {
        runInAction(() => {
          // Todo: remove this kludge which enables out-of-place temporal dependency.
          lensProtocolRouterMain.rendererLoaded = true;
        });
      },
    };
  },

  injectionToken: onRootFrameRenderInjectionToken,
});

export default flagRendererAsLoaded;
