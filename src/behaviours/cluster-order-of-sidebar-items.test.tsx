/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { DiContainer, getInjectable } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../renderer/getDiForUnitTesting";
import { fireEvent, RenderResult } from "@testing-library/react";
import {
  getClusterFrameBuilder, ClusterFrameBuilder,
} from "../renderer/components/test-utils/get-cluster-frame-builder";
import {
  SidebarItemRegistration,
  sidebarItemsInjectionToken,
} from "../renderer/components/layout/sidebar-items.injectable";
import { computed } from "mobx";
import { get, includes, noop } from "lodash/fp";
import directoryForLensLocalStorageInjectable from "../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";

describe("cluster order of sidebar items", () => {
  let di: DiContainer;
  let rendered: RenderResult;
  let clusterFrameBuilder: ClusterFrameBuilder;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForLensLocalStorageInjectable, () => "/irrelevant");

    const sidebarItemsInjectable = getInjectable({
      id: "some-sidebar-item-injectable",

      instantiate: () => {
        return computed((): SidebarItemRegistration[] => {
          return [
            {
              id: "some-parent-id",
              parentId: null,
              title: "A Some parent",
              onClick: noop,
              orderNumber: 42,
            },
            {
              id: "some-other-parent-id",
              parentId: null,
              title: "C Some other parent",
              onClick: noop,
              orderNumber: 84,
            },
            {
              id: "some-another-parent-id",
              parentId: null,
              title: "b Some another parent",
              onClick: noop,
              orderNumber: 84,
            },
            {
              id: "some-child-id",
              parentId: "some-parent-id",
              title: "A Some child",
              onClick: noop,
              orderNumber: 126,
            },
            {
              id: "some-other-child-id",
              parentId: "some-parent-id",
              title: "C Some other child",
              onClick: noop,
              orderNumber: 126,
            },
            {
              id: "some-another-child-id",
              parentId: "some-parent-id",
              title: "b Some another child",
              onClick: noop,
              orderNumber: 126,
            },
          ];
        });
      },

      injectionToken: sidebarItemsInjectionToken,
    });

    di.register(sidebarItemsInjectable);

    clusterFrameBuilder = getClusterFrameBuilder(di);
  });

  describe("when rendered", () => {
    beforeEach(async () => {
      rendered = await clusterFrameBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("has parent items in first priority order and then alphabetical", () => {
      const actual = rendered
        .queryAllByTestId("sidebar-item")

        .filter((element) =>
          includes(element.dataset.idTest)([
            "some-parent-id",
            "some-other-parent-id",
            "some-another-parent-id",
          ]),
        )

        .map(get("dataset.titleTest"));

      expect(actual).toEqual([
        "A Some parent",
        "b Some another parent",
        "C Some other parent",
      ]);
    });

    describe("when parent is expanded", () => {
      beforeEach(() => {
        const parentLink = rendered.getByTestId(
          "sidebar-item-link-for-some-parent-id",
        );

        fireEvent.click(parentLink);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("has child items in first priority order and then alphabetical", () => {
        const actual = rendered
          .queryAllByTestId("sidebar-item")
          .filter((element) => element.dataset.parentIdTest === "some-parent-id")
          .map(get("dataset.titleTest"));

        expect(actual).toEqual([
          "A Some child",
          "b Some another child",
          "C Some other child",
        ]);
      });
    });
  });
});
