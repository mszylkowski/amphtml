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

import {AmpStoryInteractive, InteractiveType} from './amp-story-interactive';
import {CSS} from '../../../build/amp-story-interactive-results-1.0.css';
import {StateProperty} from './amp-story-store-service';
import {htmlFor} from '../../../src/static-template';
import {setStyle} from '../../../src/style';

/**
 * @typedef {{
 *    category: ?string,
 *    percentage: ?number,
 * }}
 */
export let InteractiveResultsDef;

/**
 * Generates the template for the quiz.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-container">
      <div class="i-amphtml-story-interactive-results-top">
        <div class="i-amphtml-story-interactive-results-top-score">SCORE</div>
        <div class="i-amphtml-story-interactive-results-top-line"></div>
        <div class="i-amphtml-story-interactive-results-top-value">100</div>
      </div>
      <div class="i-amphtml-story-interactive-results-visuals">
        <div class="i-amphtml-story-interactive-results-dots"></div>
        <div class="i-amphtml-story-interactive-results-image-border">
          <div class="i-amphtml-story-interactive-results-image"></div>
        </div>
        <div class="i-amphtml-story-interactive-results-dots"></div>
      </div>
      <div class="i-amphtml-story-interactive-results-prompt"></div>
      <div class="i-amphtml-story-interactive-results-title"></div>
      <div class="i-amphtml-story-interactive-results-description"></div>
    </div>
  `;
};

/**
 * Processes the state and returns the condensed results.
 * @param {!Map<string, {option: ?./amp-story-interactive.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 */
const processResults = (interactiveState, options) => {
  const strategy = decideStrategy(options);
  if (strategy === 'category') {
    return processResultsCategory(interactiveState, options);
  } else if (strategy === 'percentage') {
    return processResultsPercentage(interactiveState);
  }
};

/**
 * Processes the state and returns the condensed results for a category strategy
 * @param {!Map<string, {option: ?./amp-story-interactive.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 * @package
 */
export const processResultsCategory = (interactiveState, options) => {
  const result = {'percentage': null, 'category': null};

  // Add all categories in order to the map with value 0
  const categories = {};
  options.forEach((option) => {
    if (option.resultscategory) {
      categories[option.resultscategory] = 0;
    }
  });

  // Vote for category for each answered poll
  Object.values(interactiveState).forEach((e) => {
    if (e.type == InteractiveType.POLL) {
      if (
        e.option &&
        e.option.resultscategory &&
        categories[e.option.resultscategory] != null
      ) {
        categories[e.option.resultscategory] += 1;
      }
    }
  });

  // Returns category with most votes, first ones take precedence in ties
  result.category = Object.keys(categories).reduce((a, b) =>
    categories[a] >= categories[b] ? a : b
  );
  return result;
};

/**
 * Processes the state and returns the condensed results for a percentage strategy
 * @param {!Map<string, {option: ?./amp-story-interactive.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 * @package
 */
export const processResultsPercentage = (interactiveState, options) => {
  const result = {'percentage': null, 'category': null};

  // Count quizzes and correct quizzes
  let quizCount = 0;
  let quizCorrect = 0;
  Object.values(interactiveState).forEach((e) => {
    if (e.type == InteractiveType.QUIZ) {
      quizCount += 1;
      if (e.option && e.option.correct != null) {
        quizCorrect += 1;
      }
    }
  });

  // Percentage = (correct / total) but avoid divide by 0 error
  result.percentage = quizCount == 0 ? 0 : 100 * (quizCorrect / quizCount);

  // Get closest threshold that is lower than percentage, or lowest one if percentage is too low
  let minThresholdDiff = -100;
  options.forEach((option) => {
    // ThresholdDiff is positive if it's lower than percentage (desired)
    const currThresholdDiff =
      result.percentage - parseFloat(option.resultsthreshold);
    if (
      // Curr meets the requirement and (is better or min doesnt meet)
      (currThresholdDiff >= 0 &&
        (minThresholdDiff > currThresholdDiff || minThresholdDiff < 0)) ||
      // Curr doesnt meet the requirement, but min also doesnt and curr is better than min
      (currThresholdDiff < 0 &&
        minThresholdDiff < 0 &&
        currThresholdDiff > minThresholdDiff)
    ) {
      result.category = option.resultscategory;
      minThresholdDiff = currThresholdDiff;
    }
  });
  return result;
};

/**
 * Decides what strategy to use.
 * If there are thresholds specified, it uses percentage; otherwise it uses category.
 * @param {?Array<!./amp-story-interactive.OptionConfigType>} options the attributes on the component
 * @return {string} the strategy
 * @package
 */
export const decideStrategy = (options) => {
  let strategy = 'category';
  options.forEach((o) => {
    if (o.resultsthreshold != null) {
      strategy = 'percentage';
    }
  });
  return strategy;
};

export class AmpStoryInteractiveResults extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.RESULTS, [2, 4]);
  }

  /** @override */
  buildCallback() {
    super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsTemplate(this.element);
    return this.rootEl_;
  }

  /** @override */
  layoutCallback() {
    if (this.element.hasAttribute('prompt-text')) {
      this.rootEl_.querySelector(
        '.i-amphtml-story-interactive-results-prompt'
      ).textContent = this.element.getAttribute('prompt-text');
    }
    this.storeService_.subscribe(
      StateProperty.INTERACTIVE_REACT_STATE,
      (data) => this.onInteractiveReactStateUpdate_(data),
      true
    );
  }

  /**
   * Receives state updates and fills up DOM with the result
   * @param {!Map<string, {option: ?./amp-story-interactive.OptionConfigType, interactiveId: string}>} interactiveState
   * @private
   */
  onInteractiveReactStateUpdate_(interactiveState) {
    const results = processResults(
      interactiveState,
      this.options_,
      this.element.getAttribute('strategy')
    );
    this.rootEl_.classList.toggle(
      'i-amphtml-story-interactive-results-show-score',
      results.percentage != null
    );
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-top-value'
    ).textContent = results.percentage | 0;
    this.options_.forEach((e) => {
      if (e.resultscategory === results.category) {
        this.mutateElement(() => {
          this.updateCategory_(e);
          this.updateToPostSelectionState_(null);
        });
      }
    });
  }

  /**
   * Updates the element with the correct category
   * @param {./amp-story-interactive.OptionConfigType} categorySelected
   * @private
   */
  updateCategory_(categorySelected) {
    setStyle(
      this.rootEl_.querySelector('.i-amphtml-story-interactive-results-image'),
      'background',
      'url(' + categorySelected.image + ')'
    );
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-title'
    ).textContent = categorySelected.resultscategory;
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-description'
    ).textContent = categorySelected.text || '';
  }

  /** @override */
  handleTap_(unusedEvent) {
    // Disallow click handler since there are no options.
  }

  /** @override */
  updateOptionPercentages_(unusedOptionsData) {
    // TODO(mszylkowski): Show percentages of categories if endpoint.
  }

  /** @override */
  updateStoryStoreState_(unusedOption) {
    // Prevent from updating the state.
  }
}
