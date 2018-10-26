
/* exported createSliderFromSelector */
function createSliderFromSelector(selector, options) {
    let parent = document.querySelector(selector);

    if (!options.name) {
        options.name = selector.substring(1, 2).toUpperCase() + selector.substring(2);
    }

    return createSlider(parent, options);
}

function createSlider(parent, options) {
    let precision = options.precision || 0;
    let min = options.min || 0;
    let step = options.step === undefined ? 1 : options.step;
    let value = options.value || 0;
    let max = options.max === undefined ? 1 : options.max;
    let fn = options.slide;
    let name = options.name;
    let uiPrecision = options.uiPrecision === undefined ? precision : options.uiPrecision;
    let uiMult = options.uiMult || 1;
    let scrollStep = options.scrollStep === undefined ? 3 : options.scrollStep;

    min /= step;
    max /= step;
    value /= step;

    parent.innerHTML = `
      <div class="slider_outer">
        <span class="slider_label">${name}</span>
        <span class="slider_value"></span>
        <input class="slider_slider" type="range" min="${min}" max="${max}" value="${value}">
      </div>
    `;
    let valueElem = parent.querySelector('.slider_value');
    let sliderElem = parent.querySelector('.slider_slider');

    function updateValue(value) {
        valueElem.textContent = (value * step * uiMult).toFixed(uiPrecision);
    }

    updateValue(value);

    function handleChange(event) {
        let value = parseInt(event.target.value);
        updateValue(value);
        fn(event, value * step);
    }

    function resetValue(event) {
        updateValue(value);
        sliderElem.value = value;
        fn(event, value * step);
        event.preventDefault();
    }

    function incrementValue(event) {
        let value = parseInt(event.target.value) * step + step * Math.sign(event.wheelDelta) * scrollStep;
        value = Math.min(Math.max(value, min * step), max * step);
        sliderElem.value = value / step;
        updateValue(value / step);
        fn(event, value);
        event.preventDefault();
    }

    sliderElem.addEventListener('input', handleChange);
    sliderElem.addEventListener('change', handleChange);
    parent.addEventListener('contextmenu', resetValue);
    sliderElem.addEventListener('mousewheel', incrementValue);

    return {
        elem: parent,
        updateValue: (v) => {
            sliderElem.value = v;
            updateValue(v);
            fn(null, value * step);
        },
        defaultValue: value
    };
}
