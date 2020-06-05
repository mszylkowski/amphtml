/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryReaction, ReactionType} from './amp-story-reaction';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsCategoryTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-reaction-container">
      <div class="i-amphtml-story-reaction-title">You are a</div>
      <img class="i-amphtml-story-reaction-category-image" />
      <div class="i-amphtml-story-reaction-category-selected">cat</div>
    </div>
  `;
};

export class AmpStoryReactionResultsCategory extends AmpStoryReaction {
  /**
   *
   * @param {@AmpElement} element
   */
  constructor(element) {
    super(element, ReactionType.CATEGORY, [2, 10]);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    createShadowRootWithStyle(
      this.element,
      dev().assertElement(this.rootEl_),
      CSS
    );
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsCategoryTemplate(this.element);
    return this.rootEl_;
  }
}
