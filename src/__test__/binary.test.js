import { render } from "@testing-library/svelte";
import App from "../App.svelte";

test("should render binary main", () => {
  const results = render(App, {target: document.body,props: {}});
  expect(() => results.queryByText('main')).not.toThrow();
});
