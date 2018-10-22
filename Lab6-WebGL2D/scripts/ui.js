
/* exported setupSlider */
function setupSlider(selector, options) {
    var parent = document.querySelector(selector);

    if (!options.name) {
        options.name = selector.substring(1, 2).toUpperCase() + selector.substring(2);
    }

    return createSlider(parent, options);
}

function createSlider(parent, options) {
    var precision = options.precision || 0;
    var min = options.min || 0;
    var step = options.step || 1;
    var value = options.value || 0;
    var max = options.max || 1;
    var fn = options.slide;
    var name = options.name;
    var uiPrecision = options.uiPrecision === undefined ? precision : options.uiPrecision;
    var uiMult = options.uiMult || 1;

    min /= step;
    max /= step;
    value /= step;

    parent.innerHTML = `
      <div class="slider_outer">
        <span class="slider_label">${name}</span>
        <span class="slider_value"></span>
        <input class="slider_slider" type="range" min="${min}" max="${max}" value="${value}" />
      </div>
    `;
    var valueElem = parent.querySelector(".slider_value");
    var sliderElem = parent.querySelector(".slider_slider");

    function updateValue(value) {
        valueElem.textContent = (value * step * uiMult).toFixed(uiPrecision);
    }

    updateValue(value);

    function handleChange(event) {
        var value = parseInt(event.target.value);
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
        var value = parseInt(event.target.value) * step + step * Math.sign(event.wheelDelta) * 3;
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
