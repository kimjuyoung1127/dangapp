// File: Global test setup for Vitest + Testing Library matchers.
import "@testing-library/jest-dom/vitest";

if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
}
