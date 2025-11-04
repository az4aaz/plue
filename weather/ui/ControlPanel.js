export class ControlPanel {
  constructor(config = {}, onChange = () => {}) {
    this.config = config;
    this.onChange = onChange;
    const containerId = config.CONTAINER_ID || config.containerId;
    this.container = containerId
      ? document.getElementById(containerId)
      : null;
    this.controls = new Map();
    this.values = {};
    this.isCollapsed = false;

    if (!this.container) {
      console.warn(
        "[ControlPanel] Missing container with id:",
        containerId
      );
      return;
    }

    this.container.classList.add("control-panel");

    this.createHeader();

    this.controlsContainer = document.createElement("div");
    this.controlsContainer.className = "control-panel__controls";
    this.container.appendChild(this.controlsContainer);

    const controls = Array.isArray(config.CONTROLS) ? config.CONTROLS : [];
    for (const control of controls) {
      this.createControl(control);
    }
  }

  createHeader() {
    const header = document.createElement("div");
    header.className = "control-panel__header";

    const title = document.createElement("span");
    title.className = "control-panel__title";
    title.textContent = "controls";
    header.appendChild(title);

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "control-panel__toggle";
    toggleBtn.innerHTML = "−";
    toggleBtn.setAttribute("aria-label", "Toggle controls panel");
    header.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
      this.toggle();
    });

    this.container.appendChild(header);
    this.toggleBtn = toggleBtn;
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.container.classList.add("control-panel--collapsed");
      this.toggleBtn.innerHTML = "+";
    } else {
      this.container.classList.remove("control-panel--collapsed");
      this.toggleBtn.innerHTML = "−";
    }
  }

  createControl(control) {
    if (!control?.id) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "control-panel__item";

    const label = document.createElement("label");
    label.className = "control-panel__label";
    label.htmlFor = `control-${control.id}`;
    label.textContent = control.label || control.id;
    wrapper.appendChild(label);

    const descriptor = {
      control,
      input: null,
      valueDisplay: null,
    };

    switch (control.type) {
      case "toggle": {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `control-${control.id}`;
        input.className = "control-panel__input control-panel__input--toggle";
        descriptor.input = input;
        wrapper.appendChild(input);
        input.addEventListener("change", () => {
          this.applyValue(control.id, input.checked, { emit: true });
        });
        break;
      }
      case "select": {
        const select = document.createElement("select");
        select.id = `control-${control.id}`;
        select.className = "control-panel__input control-panel__input--select";
        const options = Array.isArray(control.options)
          ? control.options
          : [];
        for (const option of options) {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label ?? option.value;
          select.appendChild(opt);
        }
        descriptor.input = select;
        wrapper.appendChild(select);
        select.addEventListener("change", () => {
          this.applyValue(control.id, select.value, { emit: true });
        });
        break;
      }
      case "range": {
        const rangeWrapper = document.createElement("div");
        rangeWrapper.className = "control-panel__range";

        const input = document.createElement("input");
        input.type = "range";
        input.id = `control-${control.id}`;
        input.className = "control-panel__input control-panel__input--range";
        if (typeof control.min === "number") {
          input.min = control.min;
        }
        if (typeof control.max === "number") {
          input.max = control.max;
        }
        if (typeof control.step === "number") {
          input.step = control.step;
        }

        const valueDisplay = document.createElement("span");
        valueDisplay.className = "control-panel__value";

        rangeWrapper.appendChild(input);
        rangeWrapper.appendChild(valueDisplay);
        wrapper.appendChild(rangeWrapper);

        descriptor.input = input;
        descriptor.valueDisplay = valueDisplay;

        input.addEventListener("input", () => {
          this.applyValue(
            control.id,
            input.value,
            { emit: true }
          );
        });
        break;
      }
      default: {
        console.warn(
          `[ControlPanel] Unsupported control type "${control.type}" for`,
          control.id
        );
        return;
      }
    }

    this.controls.set(control.id, descriptor);
    this.controlsContainer.appendChild(wrapper);

    const initial = this.coerceValue(control, control.default);
    this.values[control.id] = initial;
    this.updateInput(descriptor, initial);
  }

  applyValue(id, value, { emit = false } = {}) {
    const descriptor = this.controls.get(id);
    if (!descriptor) {
      return;
    }
    const coerced = this.coerceValue(descriptor.control, value);
    this.values[id] = coerced;
    this.updateInput(descriptor, coerced);
    if (emit && typeof this.onChange === "function") {
      this.onChange(id, coerced);
    }
  }

  setValue(id, value, { silent = false } = {}) {
    this.applyValue(id, value, { emit: !silent });
  }

  getValue(id) {
    return this.values[id];
  }

  getValues() {
    return { ...this.values };
  }

  coerceValue(control, value) {
    switch (control.type) {
      case "toggle":
        return Boolean(value);
      case "range": {
        const numeric = typeof value === "number" ? value : parseFloat(value);
        if (Number.isNaN(numeric)) {
          const fallback =
            typeof control.min === "number" ? control.min : 0;
          return fallback;
        }
        return numeric;
      }
      case "select": {
        if (typeof value === "string") {
          return value;
        }
        const options = Array.isArray(control.options)
          ? control.options
          : [];
        return options[0]?.value ?? "";
      }
      default:
        return value;
    }
  }

  updateInput(descriptor, value) {
    const { control, input, valueDisplay } = descriptor;
    if (!input) {
      return;
    }
    switch (control.type) {
      case "toggle":
        input.checked = Boolean(value);
        break;
      case "select":
        input.value = value;
        break;
      case "range":
        input.value = value;
        if (valueDisplay) {
          const precision =
            typeof control.step === "number" && control.step >= 1
              ? 0
              : 2;
          valueDisplay.textContent = Number(value).toFixed(precision);
        }
        break;
      default:
        break;
    }
  }
}
