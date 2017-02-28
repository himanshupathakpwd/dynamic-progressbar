document.addEventListener('DOMContentLoaded', function() {
    var apiUrl = '//pb-api.herokuapp.com/bars';
    barsData = {};
    getBarsData(apiUrl).then(function(response) {
        barsData = response;
        generateData(barsData);
        addEvents();
    }, function(error) {
        console.error(error);
        barsData = {
            "buttons": [
                25, 45, -8, -41
            ],
            "bars": [
                25, 66, 37, 78
            ],
            "limit": 170
        };
        generateData(barsData);
        addEvents();
    });
});

function getBarsData(url) {
    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'json';
        request.onload = function() {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(Error('URL didn\'t load successfully; error code:' + request.statusText));
            }
        };
        request.onerror = function() {
            reject(Error('There was a network error.'));
        };
        request.send();
    });
}

function generateData(barsData) {
    generateLimit(barsData.limit);
    generateBars(barsData.bars);
    generateBarSelectors(barsData.bars.length);
    generateButtons(barsData.buttons);
}

function generateBars(bars) {
    if (bars.length) {
        var bar = document.createElement('div');
        bar.classList.add('bar');
        var progress = document.createElement('div');
        progress.classList.add('progress');
        progress.setAttribute('data-width', 0);
        bar.appendChild(progress);
        var amount = document.createElement('span');
        amount.classList.add('amount');
        bar.appendChild(amount);
        var barWrapper = document.querySelectorAll('.bars')[0];
        for (var i in bars) {
            var barClone = bar.cloneNode(true);
            barClone.setAttribute('id', 'bar' + i);
            barWrapper.appendChild(barClone);
            updateWidth(barClone, bars[i]);
        }
    }
}

function setWidth(barAndSpan) {
    var progressToUpdate = barAndSpan.progressToUpdate;
    var spanToUpdate = barAndSpan.spanToUpdate;
    var totalWidthPercent = barAndSpan.totalWidthPercent;
    var upperLimit = document.querySelector('.upper-limit').value;
    var lowerLimit = 0;
    var currentWidthPercent = progressToUpdate.getAttribute('data-width');
    var intervalId = setInterval(animteBar, 10);
    function animteBar() {
        if (currentWidthPercent != totalWidthPercent) {
            if (currentWidthPercent > totalWidthPercent) {
                if (currentWidthPercent == lowerLimit) {
                    console.log('exiting due to lower limit');
                    clearInterval(intervalId);
                    return;
                }
                currentWidthPercent--;
            } else if (currentWidthPercent < totalWidthPercent) {
                if (currentWidthPercent == upperLimit) {
                    console.log('exiting due to upper limit');
                    clearInterval(intervalId);
                    return;
                }
                currentWidthPercent++;
            }
            progressToUpdate.style.backgroundColor = '#84b7cc';
            var percentToUpdate = currentWidthPercent + '%';
            if (currentWidthPercent >= 100) {
                progressToUpdate.style.backgroundColor = '#ab2323';
            }
            if (currentWidthPercent <= 100) {
                progressToUpdate.style.width = percentToUpdate;
            }
            spanToUpdate.textContent = percentToUpdate;
            progressToUpdate.setAttribute('data-width', currentWidthPercent);
        } else {
            clearInterval(intervalId);
        }
    }
}

function updateWidth(elem, increment) {
    var barAndSpan = getBarAndSpan(elem);
    var spanToUpdate = barAndSpan.spanToUpdate;
    var progressToUpdate = barAndSpan.progressToUpdate;
    var currentWidthPercent = progressToUpdate.getAttribute('data-width');
    barAndSpan.totalWidthPercent = +currentWidthPercent + increment;
    console.log(barAndSpan.totalWidthPercent);
    setWidth(barAndSpan);
}

function getBarAndSpan(elem) {
    return {spanToUpdate: elem.querySelector('.amount'), progressToUpdate: elem.querySelector('.progress')};
}

function generateButtons(buttons) {
    if (buttons.length) {
        var button = document.createElement('button');
        var buttonWrapper = document.querySelectorAll('.buttons')[0];
        for (var i in buttons) {
            var buttonClone = button.cloneNode(true);
            buttonClone.innerHTML = buttons[i];
            buttonWrapper.appendChild(buttonClone);
        }
    }
}

function generateLimit(limit) {
    var input = document.createElement('input');
    input.classList.add('upper-limit');
    input.type = 'hidden';
    input.value = limit;
    var controls = document.querySelector('.controls');
    controls.appendChild(input);
}

function generateBarSelectors(totalBars) {
    var barSelectorWrapper = document.querySelector('.bar-selector');
    var select = document.createElement('select');
    select.setAttribute('id', 'barChooser');
    barSelectorWrapper.appendChild(select);
    var option = document.createElement('option');
    for (var i = 0; i < totalBars; i++) {
        var optionClone = option.cloneNode(true);
        optionClone.innerHTML = '#progress' + (i + 1);
        optionClone.setAttribute('value', 'bar' + i);
        select.appendChild(optionClone);
    }
}

function addEvents() {
    document.querySelectorAll('.buttons > button').forEach(function(value, index) {
        value.addEventListener('click', updateBarWidth);
    });
}

function updateBarWidth(e) {
    var selectedBarId = document.querySelector('#barChooser').value;
    var increment = e.target.textContent;
    increment = +increment;
    console.log(increment);
    updateWidth(document.querySelector('#' + selectedBarId), increment);
}
