import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DialogBackdrop } from "../../src/components/dashboard/dialog-backdrop";

describe("DialogBackdrop", () => {
  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DialogBackdrop onClose={onClose}>
        <section role="dialog">Dialog content</section>
      </DialogBackdrop>,
    );

    await user.click(screen.getByTestId("dialog-backdrop"));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when dialog content is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DialogBackdrop onClose={onClose}>
        <section role="dialog">
          <button type="button">Action</button>
        </section>
      </DialogBackdrop>,
    );

    await user.click(screen.getByRole("button", { name: "Action" }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
