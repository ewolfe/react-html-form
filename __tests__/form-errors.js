import React from "react";
import { act } from "react-dom/test-utils";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

const NAME = "input";
const ERROR_MESSAGE = "Not a color";
const REGEXP = /^#[a-f0-9]+$/;
const USER_INPUT = "#dadb0dy";

const dataReader = jest.fn();
const handleReset = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
  handleReset.mockReset();
});

test("HTMLElement constraints cause form error", async done => {
  const handleData = state => {
    if (state.errors[NAME]) dataReader(state.errors[NAME]);
  };

  const { getByLabelText } = render(
    <Form onReset={handleReset} onData={handleData}>
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" pattern={REGEXP.toString()} />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalled();

  done();
});

test("validateOnChange with domValidation", async done => {
  const handleData = (_e, state) => {
    if (state.errors[NAME]) dataReader(state.errors[NAME]);
  };

  const { getByLabelText } = render(
    <Form
      domValidation
      onReset={handleReset}
      onChangeWithData={handleData}
      validateOnChange={{
        [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(input.validationMessage).toBe(ERROR_MESSAGE);

  done();
});

test("validateOnChange", async done => {
  const handleData = (_e, state) => {
    if (state.errors[NAME]) dataReader(state.errors[NAME]);
  };

  const { getByLabelText } = render(
    <Form
      onReset={handleReset}
      onChangeWithData={handleData}
      validateOnChange={{
        [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalled();

  done();
});

test("validateOnBlur with domValidation", async done => {
  const handleData = state => {
    if (state.errors[NAME]) dataReader(state.errors[NAME]);
  };

  const { getByLabelText } = render(
    <Form
      domValidation
      onData={handleData}
      validateOnBlur={{
        [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(input.validationMessage).toBe(ERROR_MESSAGE);

  done();
});

test("validateOnBlur", async done => {
  const handleData = state => {
    if (state.errors[NAME]) dataReader(state.errors[NAME]);
  };

  const { getByLabelText } = render(
    <Form
      onReset={handleReset}
      onData={handleData}
      validateOnBlur={{
        [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalled();

  done();
});

test("Focus the first element with an error", async done => {
  const { getByLabelText, getByText } = render(
    <Form onSubmit={event => event.preventDefault()}>
      <label htmlFor="A">
        A
        <input id="A" name="A" type="text" pattern="^[a-f0-9]$" />
      </label>
      <label htmlFor="B">
        B
        <input id="B" name="B" type="text" pattern="^[a-f0-9]$" />
      </label>

      <button type="submit">Submit</button>
    </Form>
  );

  const inputA = getByLabelText("A");
  const inputB = getByLabelText("B");
  const submit = getByText("Submit");

  await userEvent.type(inputA, "boboddy");
  await userEvent.type(inputB, "boboddy");
  await userEvent.click(submit);

  expect(inputA).toBe(document.activeElement);

  done();
});

test("domValidation is overriden by validateOnChange", async done => {
  const { getByLabelText } = render(
    <Form
      domValidation
      onSubmit={event => event.preventDefault()}
      validateOnChange={{
        [NAME]: value => (REGEXP.test(value) ? "" : "validateOnChange")
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input
          id={NAME}
          name={NAME}
          type="text"
          pattern={REGEXP.toString()}
          data-errormessage="data-errormessage"
        />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);

  await userEvent.type(input, "boboddy");

  expect(input.validationMessage).toBe("validateOnChange");

  done();
});

/** @FIXME
 * Validation is intentionally fired after reset but not on mount...
 * Is this an intentional feature, or an oversight?
 */
// eslint-disable-next-line jest/no-disabled-tests
test("Reset form", async done => {
  jest.useFakeTimers(); // reset depends upon setTimeout
  function FormStateManager(props) {
    const [error, setError] = React.useState("");
    const handleData = state => {
      setError(state.errors[NAME]);
    };

    return props.children(error, handleData);
  }

  const { getByLabelText, queryByText } = render(
    <FormStateManager>
      {(error, handleData) => (
        <Form
          onData={handleData}
          validateOnChange={{
            [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
          }}
        >
          <label htmlFor={NAME}>
            Input here
            <input id={NAME} name={NAME} type="text" />
            {error && <p>{error}</p>}
          </label>

          <button type="reset">Reset</button>
        </Form>
      )}
    </FormStateManager>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  await queryByText(ERROR_MESSAGE);

  await act(async () => {
    await fireEvent.click(queryByText("Reset"));
    await jest.runAllTimers();
  });

  await waitFor(async () => {
    expect(queryByText(ERROR_MESSAGE)).toBeNull();
  });

  done();
});
