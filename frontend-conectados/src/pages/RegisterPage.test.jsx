import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import RegisterPage from "./RegisterPage";

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

describe("RegisterPage", () => {
  const mockRegister = jest.fn();

  const renderPage = () =>
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: mockRegister }}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

  const fillFormFields = (data) => {
    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: data.name },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: data.email },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: data.password },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: data.confirmPassword },
    });
  };

  const getTermsCheckbox = () =>
    screen.getByRole("checkbox", { name: /términos y condiciones/i });

  const getTermsLinkButton = () =>
    screen.getByRole("button", { name: /términos y condiciones/i });

  const simulateScrollToModalEnd = async () => {
    // eslint-disable-next-line testing-library/no-node-access
    const scrollableContent = document.querySelector(".overflow-y-auto");
    if (!scrollableContent) throw new Error("No se encontró modal");

    Object.defineProperty(scrollableContent, "scrollHeight", {
      value: 500,
      writable: true,
    });
    Object.defineProperty(scrollableContent, "clientHeight", {
      value: 100,
      writable: true,
    });
    Object.defineProperty(scrollableContent, "scrollTop", {
      value: 400,
      writable: true,
    });

    fireEvent.scroll(scrollableContent);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza todos los campos esperados", () => {
    renderPage();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número celular/i)).toBeInTheDocument();
  });

  test("muestra error si las contraseñas no coinciden", async () => {
    renderPage();
    fillFormFields({
      name: "Juan",
      email: "juan@example.com",
      password: "1234",
      confirmPassword: "5678",
    });

    fireEvent.click(getTermsCheckbox());
    await screen.findByText("Términos y Condiciones");
    await simulateScrollToModalEnd();
    fireEvent.click(screen.getByRole("button", { name: /aceptar/i }));

    fireEvent.click(screen.getByRole("button", { name: /registrarme/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/las contraseñas no coinciden/i)
      ).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("muestra error si el número celular tiene un formato inválido", async () => {
    renderPage();
    fillFormFields({
      name: "Carlos",
      email: "carlos@example.com",
      password: "abcd1234",
      confirmPassword: "abcd1234",
    });

    fireEvent.change(screen.getByLabelText(/número celular/i), {
      target: { value: "123456" },
    });

    fireEvent.click(getTermsCheckbox());
    await screen.findByText("Términos y Condiciones");
    await simulateScrollToModalEnd();
    fireEvent.click(screen.getByRole("button", { name: /aceptar/i }));
    fireEvent.click(screen.getByRole("button", { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByText(/número celular inválido/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  test("envía número celular si se completa correctamente", async () => {
    renderPage();
    fillFormFields({
      name: "Sofía",
      email: "sofia@example.com",
      password: "abcd1234",
      confirmPassword: "abcd1234",
    });

    fireEvent.change(screen.getByLabelText(/número celular/i), {
      target: { value: "56912345678" },
    });

    fireEvent.click(getTermsCheckbox());
    await screen.findByText("Términos y Condiciones");
    await simulateScrollToModalEnd();
    fireEvent.click(screen.getByRole("button", { name: /aceptar/i }));
    fireEvent.click(screen.getByRole("button", { name: /registrarme/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    const payload = mockRegister.mock.calls[0][0];
    expect(payload).toHaveProperty("numero", "56912345678");
  });

  test("abre el modal de términos y condiciones desde el checkbox", async () => {
    renderPage();
    fireEvent.click(getTermsCheckbox());
    expect(
      await screen.findByText("Términos y Condiciones")
    ).toBeInTheDocument();
  });

  test("abre el modal de términos y condiciones desde el botón de texto", async () => {
    renderPage();
    fireEvent.click(getTermsLinkButton());
    expect(
      await screen.findByText("Términos y Condiciones")
    ).toBeInTheDocument();
  });

  test("el botón 'Aceptar' en el modal está deshabilitado al inicio", async () => {
    renderPage();
    fireEvent.click(getTermsCheckbox());
    expect(
      await screen.findByRole("button", { name: /aceptar/i })
    ).toBeDisabled();
  });

  test("scroll habilita el botón 'Aceptar' en el modal", async () => {
    renderPage();
    fireEvent.click(getTermsCheckbox());
    const acceptBtn = await screen.findByRole("button", { name: /aceptar/i });
    expect(acceptBtn).toBeDisabled();
    await simulateScrollToModalEnd();
    expect(acceptBtn).toBeEnabled();
  });

  test("clic en 'Aceptar' cierra el modal y acepta los términos", async () => {
    renderPage();
    fireEvent.click(getTermsCheckbox());
    await screen.findByText("Términos y Condiciones");
    await simulateScrollToModalEnd();
    fireEvent.click(screen.getByRole("button", { name: /aceptar/i }));

    await waitFor(() => {
      expect(
        screen.queryByText("Términos y Condiciones")
      ).not.toBeInTheDocument();
    });
    expect(getTermsCheckbox()).toBeChecked();
  });

  test("clic en 'Cancelar' cierra el modal pero no acepta términos", async () => {
    renderPage();
    fireEvent.click(getTermsCheckbox());
    await screen.findByText("Términos y Condiciones");
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() => {
      expect(
        screen.queryByText("Términos y Condiciones")
      ).not.toBeInTheDocument();
    });
    expect(getTermsCheckbox()).not.toBeChecked();
  });
});
