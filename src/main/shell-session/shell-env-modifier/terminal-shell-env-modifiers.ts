/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { ClusterId } from "../../../common/cluster-types";
import { isDefined } from "../../../common/utils";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";
import type { CatalogEntityRegistry } from "../../catalog";

interface Dependencies {
  extensions: IComputedValue<LensMainExtension[]>;
  entityRegistry: CatalogEntityRegistry;
}

export type TerminalShellEnvModify = (clusterId: ClusterId, env: Partial<Record<string, string>>) => Partial<Record<string, string>>;

export const terminalShellEnvModify = ({
  extensions,
  entityRegistry,
}: Dependencies): TerminalShellEnvModify => (
  (clusterId, env) => {
    const terminalShellEnvModifiers = computed(() => (
      extensions.get()
        .map((extension) => extension.terminalShellEnvModifier)
        .filter(isDefined)
    ))
      .get();

    if (terminalShellEnvModifiers.length === 0) {
      return env;
    }

    const entity = entityRegistry.findById(clusterId);

    if (entity) {
      const ctx = { catalogEntity: entity };

      // clone it so the passed value is not also modified
      env = JSON.parse(JSON.stringify(env));
      env = terminalShellEnvModifiers.reduce((env, modifier) => modifier(ctx, env), env);
    }

    return env;
  }
);
