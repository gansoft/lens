/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../routes/all-routes.injectable";

const entitySettingsRouteInjectable = getInjectable({
  id: "entity-settings-route",

  instantiate: () => ({
    title: "Entity Settings",
    path: "/entity/:entityId/settings",
    clusterFrame: false,
    isEnabled: () => true,
  }),

  injectionToken: routeInjectionToken,
});

export default entitySettingsRouteInjectable;
