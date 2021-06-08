/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Controls what pages should be preloaded first.
 * @param {AmpStory} ampStory
 */
export class AmpStoryPageLoader {
  /**
   * @param {!AmpStory} ampStory
   */
  constructor(ampStory) {
    /** @private {!AmpStory} */
    this.ampStory_ = ampStory;

    /** @private {?Promise} */
    this.currentLoadPromise_ = null;
  }

  /**
   * Calls preload on the pages.
   * @param {Array<Array<string>>} pagesByDistance
   */
  preloadPagesByDistance(pagesByDistance) {
    pagesByDistance.slice(0, 3).forEach((pageIds) => {
      const stepPromise = () =>
        Promise.all(
          pageIds.map((pageId) => {
            console.log('registering', pageId);
            return this.ampStory_
              .getPageById(pageId)
              .preloadAssets()
              .then(() => console.log('registered', pageId));
          })
        );
      if (this.currentLoadPromise_ == null) {
        this.currentLoadPromise_ = stepPromise();
      } else {
        this.currentLoadPromise_ = this.currentLoadPromise_.then(stepPromise);
      }
    });
  }
}
