import React from "react";
import {
  render,
  fireEvent,
  waitForElement,
  waitForElementToBeRemoved
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

const NAME = "input";
const ERROR_MESSAGE = "Not a color";
const REGEXP_PATTERN = "^#[a-f0-9]+$";
const REGEXP = new RegExp(REGEXP_PATTERN);
const USER_INPUT = "#dadb0dy";

const dataReader = jest.fn();
const handleBlur = jest.fn();
const handleChange = jest.fn();
const handleChangeWithData = jest.fn();
const handleFocus = jest.fn();
const handleReset = jest.fn();
const handleResetWithData = jest.fn();
const handleSubmit = jest.fn();
const handleSubmitWithData = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
  handleBlur.mockReset();
  handleChange.mockReset();
  handleChangeWithData.mockReset();
  handleFocus.mockReset();
  handleReset.mockReset();
  handleResetWithData.mockReset();
  handleSubmit.mockReset();
  handleSubmitWithData.mockReset();
});

test("HTMLElement constraints cause form error", async done => {
  const handleData = state => {
    try {
      if (state.errors[NAME]) dataReader(state.errors[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form onReset={handleReset} onData={handleData}>
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" pattern={REGEXP_PATTERN} />
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

test("validateOnChange", async done => {
  const handleData = state => {
    try {
      if (state.errors[NAME]) dataReader(state.errors[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form
      onReset={handleReset}
      onData={handleData}
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

test("validateOnBlur", async done => {
  const handleData = state => {
    try {
      if (state.errors[NAME]) dataReader(state.errors[NAME]);
    } catch (error) {
      // drop it
    }
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

test("Reset form", async done => {
  function FormContainer(props) {
    const [error, setError] = React.useState("");
    const handleData = state => {
      try {
        setError(state.errors[NAME]);
      } catch (e) {
        // do nothing
      }
    };

    return props.children(error, handleData);
  }
  const { getByLabelText, getByText } = render(
    <FormContainer>
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
    </FormContainer>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  await waitForElement(() => getByText(ERROR_MESSAGE));

  await fireEvent.click(getByText("Reset"));
  await waitForElementToBeRemoved(() => getByText(ERROR_MESSAGE));

  done();
});