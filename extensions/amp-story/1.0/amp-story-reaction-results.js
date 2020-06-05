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

import {Layout} from '../../../src/layout';
import {StateProperty, getStoreService} from './amp-story-store-service';
// import {htmlFor} from '../../../src/static-template';

// /**
//  * Generates the template for the quiz.
//  *
//  * @param {!Element} element
//  * @return {!Element}
//  */
// const buildResultsTemplate = (element) => {
//   const html = htmlFor(element);
//   return html`
//     <div
//       class="i-amphtml-story-reaction-results-container"
//       style="background-color:white; border-radius:8px; height: 300px; width:300px"
//     >
//       <div class="i-amphtml-story-reaction-results-finished">
//         <div>You got</div>
//         <div class="i-amphtml-story-reaction-results-percentage"></div>
//         <div class="i-amphtml-story-reaction-results-message">
//           You're done, congratulations!
//         </div>
//       </div>
//       <div class="i-amphtml-story-reaction-results-unfinished">
//         <div style="margin-bottom:20px">
//           You have not finished all the quizzes, come back when you're done!
//         </div>
//         <div class="i-amphtml-story-reaction-results-completeness"></div>
//       </div>
//     </div>
//   `;
// };

export class AmpStoryReactionResults extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.storeService = getStoreService(this.win);
  }

  /** @override */
  buildCallback() {
    // this.element.appendChild(buildResultsTemplate(this.element));
  }

  /** @override */
  layoutCallback() {
    this.storeService.subscribe(
      StateProperty.INTERACTION_REACT_STATE,
      (data) => {
        this.processData(data);
      },
      true
    );
  }

  /**
   * Gets the map of quizzes responded and sets the correct values on the template.
   * @param {*} data
   */
  processData(data) {
    let completed = 0;
    let correct = 0;
    let totalCount = 0;
    const categories = {'': -1};
    Object.values(data).forEach((reactionConfig) => {
      totalCount += 1;
      if (reactionConfig['option'] == null) {
        return;
      }
      completed += 1;
      if (reactionConfig['option']['correct'] != undefined) {
        correct += 1;
      }
      if (reactionConfig['option']['category'] != undefined) {
        reactionConfig['categories'].forEach((category) => {
          if (categories[category] == undefined) {
            categories[category] = 0;
          }
        });
        categories[reactionConfig['option']['category']] += 1;
      }
    });
    if (totalCount == 0) {
      totalCount = 1;
    }
    const results = {
      'completed': completed,
      'totalCount': totalCount,
      'correct': correct,
      'finished': completed == totalCount,
      'percentageCorrect': ((correct / totalCount) * 100).toFixed(0),
      'percentageCompleted': ((completed / totalCount) * 100).toFixed(0),
      'category': Object.entries(categories).reduce((prev, curr) =>
        prev[1] > curr[1] ? prev : curr
      )[0],
      'categories': Object.keys(categories).sort(),
    };

    AMP.setState({
      'results': results,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}
