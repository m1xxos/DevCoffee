// Игровой движок DevCoffee
const game = {
    money: 0,
    score: 0,
    customerNumber: 1,
    currentOrder: null,
    totalCustomers: 0,

    drinks: {
        espresso: { name: 'Эспрессо', price: 120, steps: ['grind', 'tamp', 'brew'] },
        latte: { name: 'Латте', price: 180, steps: ['grind', 'brew', 'steam', 'pour-milk'] },
        cappuccino: { name: 'Капучино', price: 160, steps: ['grind', 'brew', 'steam', 'add-foam'] },
        americano: { name: 'Американо', price: 100, steps: ['grind', 'brew', 'add-water'] }
    },

    toppings: {
        syrup_vanilla: { name: 'Ванильный сироп', price: 30, icon: '🍯', step: 'add-syrup' },
        syrup_caramel: { name: 'Карамельный сироп', price: 30, icon: '🍮', step: 'add-syrup' },
        syrup_hazelnut: { name: 'Ореховый сироп', price: 30, icon: '🌰', step: 'add-syrup' },
        whipped_cream: { name: 'Взбитые сливки', price: 40, icon: '🍦', step: 'add-cream' },
        cinnamon: { name: 'Корица', price: 10, icon: '✨', step: 'add-spice' },
        chocolate: { name: 'Шоколад', price: 35, icon: '🍫', step: 'add-chocolate' }
    },

    stepNames: {
        'grind': 'Намолоть кофе',
        'tamp': 'Утрамбовать',
        'brew': 'Пролить эспрессо',
        'steam': 'Взбить молоко',
        'pour-milk': 'Влить молоко',
        'add-foam': 'Добавить пену',
        'add-water': 'Добавить горячую воду',
        'add-syrup': 'Добавить сироп',
        'add-cream': 'Добавить взбитые сливки',
        'add-spice': 'Добавить специи',
        'add-chocolate': 'Добавить шоколад'
    },

    // Инициализация игры
    init() {
        this.setupEventListeners();
    },

    // Начать игру
    startGame() {
        this.money = 0;
        this.score = 0;
        this.customerNumber = 1;
        this.totalCustomers = 0;
        this.updateStats();
        this.showScreen('order-screen');
        this.startOrderPhase();
    },

    // Обновить статистику
    updateStats() {
        document.getElementById('money').textContent = this.money;
        document.getElementById('score').textContent = this.score;
        document.getElementById('customer-number').textContent = this.customerNumber;
    },

    // Показать экран
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },

    // === МИНИ-ИГРА 1: ПРИНЯТЬ ЗАКАЗ ===
    startOrderPhase() {
        const drinks = Object.keys(this.drinks);
        const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];
        
        // Случайно выбираем 0-2 топпинга
        const toppingsList = Object.keys(this.toppings);
        const numToppings = Math.floor(Math.random() * 3); // 0, 1 или 2
        const selectedToppings = [];
        const usedIndices = new Set();
        
        for (let i = 0; i < numToppings; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * toppingsList.length);
            } while (usedIndices.has(randomIndex));
            usedIndices.add(randomIndex);
            selectedToppings.push(toppingsList[randomIndex]);
        }
        
        this.currentOrder = {
            drink: randomDrink,
            name: this.drinks[randomDrink].name,
            price: this.drinks[randomDrink].price,
            steps: [...this.drinks[randomDrink].steps],
            toppings: selectedToppings,
            selectedToppings: []
        };

        // Добавляем стоимость топпингов
        selectedToppings.forEach(topping => {
            this.currentOrder.price += this.toppings[topping].price;
        });

        // Формируем текст заказа
        let orderText = `Здравствуйте! Я хочу ${this.currentOrder.name}`;
        if (selectedToppings.length > 0) {
            orderText += ' с ' + selectedToppings.map(t => this.toppings[t].name.toLowerCase()).join(' и ');
        }
        orderText += ', пожалуйста!';
        
        document.getElementById('customer-speech').textContent = orderText;
        document.getElementById('order-feedback').textContent = '';
        document.getElementById('order-feedback').className = '';
        
        // Сбросить выбранные топпинги в UI
        document.querySelectorAll('.topping-item').forEach(item => {
            item.classList.remove('selected');
        });
    },

    setupEventListeners() {
        // Обработка выбора напитка
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectDrink(e.currentTarget));
        });

        // Обработка выбора топпингов
        document.querySelectorAll('.topping-item').forEach(item => {
            item.addEventListener('click', (e) => this.toggleTopping(e.currentTarget));
        });

        // Кнопка подтверждения заказа
        document.getElementById('confirm-order').addEventListener('click', () => this.confirmOrder());

        // Обработка кнопок денег
        document.querySelectorAll('.money-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.addMoney(e.currentTarget));
        });

        // Подтверждение оплаты
        document.getElementById('confirm-payment').addEventListener('click', () => this.confirmPayment());

        // Перетаскивание чашки
        this.setupDragAndDrop();
    },

    selectDrink(element) {
        // Убираем выделение со всех напитков
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Выделяем выбранный напиток
        element.classList.add('selected');
        this.selectedDrink = element.dataset.drink;
    },

    toggleTopping(element) {
        const topping = element.dataset.topping;
        
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            const index = this.currentOrder.selectedToppings.indexOf(topping);
            if (index > -1) {
                this.currentOrder.selectedToppings.splice(index, 1);
            }
        } else {
            element.classList.add('selected');
            this.currentOrder.selectedToppings.push(topping);
        }
    },

    confirmOrder() {
        const feedback = document.getElementById('order-feedback');
        
        if (!this.selectedDrink) {
            feedback.textContent = '✗ Выберите напиток!';
            feedback.className = 'feedback-error shake';
            return;
        }

        // Проверяем правильность напитка
        if (this.selectedDrink !== this.currentOrder.drink) {
            feedback.textContent = '✗ Неправильный напиток! Попробуйте еще раз.';
            feedback.className = 'feedback-error shake';
            return;
        }

        // Проверяем правильность топпингов
        const correctToppings = this.currentOrder.toppings.sort().join(',');
        const selectedToppings = this.currentOrder.selectedToppings.sort().join(',');
        
        if (correctToppings !== selectedToppings) {
            feedback.textContent = '✗ Неправильные топпинги! Проверьте заказ.';
            feedback.className = 'feedback-error shake';
            return;
        }

        feedback.textContent = '✓ Отлично! Вы правильно приняли заказ!';
        feedback.className = 'feedback-success pulse';
        this.score += 10;
        this.updateStats();
        setTimeout(() => this.startPreparationPhase(), 1500);
    },

    // === МИНИ-ИГРА 2: ПРИГОТОВИТЬ ЗАКАЗ ===
    startPreparationPhase() {
        this.showScreen('prepare-screen');
        
        // Формируем полное название заказа
        let fullOrderName = this.currentOrder.name;
        if (this.currentOrder.toppings.length > 0) {
            fullOrderName += ' с ' + this.currentOrder.toppings.map(t => this.toppings[t].name.toLowerCase()).join(', ');
        }
        document.getElementById('current-order-name').textContent = fullOrderName;
        
        // Добавляем шаги для топпингов
        const allSteps = [...this.currentOrder.steps];
        this.currentOrder.toppings.forEach(topping => {
            allSteps.push(this.toppings[topping].step);
        });

        // Создаем интерактивную зону для приготовления в РАЗНОБОЙ
        this.setupInteractiveCooking(allSteps);
        
        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('machine-status').textContent = 'Выполняйте действия по порядку!';
        
        this.currentStepIndex = 0;
        this.totalSteps = allSteps.length;
        this.allSteps = allSteps;
    },

    setupInteractiveCooking(steps) {
        const interactiveArea = document.getElementById('interactive-cooking');
        interactiveArea.innerHTML = '';
        
        // Иконки для разных действий
        const icons = {
            'grind': '⚙️',
            'tamp': '👇',
            'brew': '☕',
            'steam': '💨',
            'pour-milk': '🥛',
            'add-foam': '🌊',
            'add-water': '💧',
            'add-syrup': '🍯',
            'add-cream': '🍦',
            'add-spice': '✨',
            'add-chocolate': '🍫'
        };
        
        // Создаем массив с индексами и перемешиваем его
        const shuffledIndices = steps.map((_, index) => index);
        this.shuffleArray(shuffledIndices);
        
        // Создаем кнопки в случайном порядке
        shuffledIndices.forEach(index => {
            const step = steps[index];
            const button = document.createElement('div');
            button.className = 'interactive-step';
            button.dataset.step = step;
            button.dataset.index = index;
            
            button.innerHTML = `
                <div class="step-icon">${icons[step] || '🔧'}</div>
            `;
            
            button.addEventListener('click', () => this.performInteractiveStep(button, step, index));
            interactiveArea.appendChild(button);
        });
    },
    
    // Функция для перемешивания массива (алгоритм Фишера-Йейтса)
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    performInteractiveStep(button, step, stepIndex) {
        if (stepIndex !== this.currentStepIndex) {
            button.classList.add('shake');
            setTimeout(() => button.classList.remove('shake'), 300);
            document.getElementById('machine-status').textContent = 'Выполняйте шаги по порядку!';
            return;
        }

        // Анимация для конкретного шага
        button.classList.add('active');
        this.animateStep(button, step);
        
        this.currentStepIndex++;
        
        const progress = (this.currentStepIndex / this.totalSteps) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        setTimeout(() => {
            if (this.currentStepIndex === this.totalSteps) {
                document.getElementById('machine-status').textContent = '✓ Заказ готов!';
                this.score += 20;
                this.updateStats();
                setTimeout(() => this.startServePhase(), 1500);
            } else {
                document.getElementById('machine-status').textContent = 
                    `Следующий шаг: ${this.stepNames[this.allSteps[this.currentStepIndex]]}`;
            }
        }, 800);
    },

    animateStep(button, step) {
        const icon = button.querySelector('.step-icon');
        
        // Разные анимации для разных действий
        switch(step) {
            case 'grind':
                icon.style.animation = 'spin 0.8s ease-in-out';
                break;
            case 'tamp':
                icon.style.animation = 'press 0.8s ease-in-out';
                break;
            case 'brew':
                icon.style.animation = 'brew 0.8s ease-in-out';
                break;
            case 'steam':
                icon.style.animation = 'steam 0.8s ease-in-out';
                break;
            default:
                icon.style.animation = 'pulse 0.8s ease-in-out';
        }
        
        setTimeout(() => {
            icon.style.animation = '';
        }, 800);
    },

    // === МИНИ-ИГРА 3: ОТДАТЬ ЗАКАЗ ===
    startServePhase() {
        this.showScreen('serve-screen');
        
        const coffeeCup = document.getElementById('coffee-cup');
        const customerZone = document.getElementById('customer-zone');
        
        // Сброс позиции и состояния
        coffeeCup.style.transform = '';
        customerZone.classList.remove('drop-target');
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;
    },

    setupDragAndDrop() {
        const coffeeCup = document.getElementById('coffee-cup');
        const customerZone = document.getElementById('customer-zone');
        
        let isDragging = false;
        let startX, startY;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;

        coffeeCup.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - this.dragCurrentX;
            startY = e.clientY - this.dragCurrentY;
            coffeeCup.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            this.dragCurrentX = e.clientX - startX;
            this.dragCurrentY = e.clientY - startY;
            
            coffeeCup.style.transform = `translate(${this.dragCurrentX}px, ${this.dragCurrentY}px)`;

            // Проверка попадания в зону клиента
            const cupRect = coffeeCup.getBoundingClientRect();
            const zoneRect = customerZone.getBoundingClientRect();
            
            if (this.checkOverlap(cupRect, zoneRect)) {
                customerZone.classList.add('drop-target');
            } else {
                customerZone.classList.remove('drop-target');
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            coffeeCup.classList.remove('dragging');

            const cupRect = coffeeCup.getBoundingClientRect();
            const zoneRect = customerZone.getBoundingClientRect();

            if (this.checkOverlap(cupRect, zoneRect)) {
                customerZone.classList.remove('drop-target');
                this.score += 15;
                this.updateStats();
                document.getElementById('serve-instruction').textContent = '✓ Заказ доставлен!';
                document.getElementById('serve-instruction').classList.add('feedback-success');
                setTimeout(() => this.startPaymentPhase(), 1500);
            } else {
                // Вернуть на место
                this.dragCurrentX = 0;
                this.dragCurrentY = 0;
                coffeeCup.style.transform = '';
                customerZone.classList.remove('drop-target');
            }
        });
    },

    checkOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    },

    // === МИНИ-ИГРА 4: ПОЛУЧИТЬ ОПЛАТУ ===
    startPaymentPhase() {
        this.showScreen('payment-screen');
        
        const price = this.currentOrder.price;
        document.getElementById('payment-amount').textContent = price;
        
        // Российские купюры: 10, 50, 100, 200, 500, 1000, 2000, 5000
        const bills = [10, 50, 100, 200, 500, 1000, 2000, 5000];
        
        // Находим подходящие купюры (больше или равно цене)
        const suitableBills = bills.filter(bill => bill >= price);
        
        // Если нет подходящей одной купюры, используем комбинацию
        let customerAmount;
        if (suitableBills.length > 0 && Math.random() > 0.3) {
            // 70% шанс что клиент даст одну купюру
            customerAmount = suitableBills[Math.floor(Math.random() * suitableBills.length)];
        } else {
            // 30% шанс что клиент даст комбинацию купюр (округляем в большую сторону до ближайшей купюры)
            const nextBill = bills.find(bill => bill > price);
            if (nextBill) {
                // Иногда дают чуть больше
                const options = [nextBill];
                const evenBigger = bills.find(bill => bill > nextBill);
                if (evenBigger) options.push(evenBigger);
                customerAmount = options[Math.floor(Math.random() * options.length)];
            } else {
                customerAmount = price; // Точная сумма
            }
        }
        
        this.customerGave = customerAmount;
        document.getElementById('customer-gave').textContent = this.customerGave;
        
        this.collectedMoney = 0;
        this.updatePaymentDisplay();
        
        document.getElementById('payment-feedback').textContent = '';
        document.getElementById('payment-feedback').className = '';
    },

    addMoney(button) {
        const value = parseInt(button.dataset.value);
        this.collectedMoney += value;
        this.updatePaymentDisplay();
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 500);
    },

    updatePaymentDisplay() {
        const change = this.customerGave - this.currentOrder.price;
        document.getElementById('change-amount').textContent = change;
    },

    confirmPayment() {
        const correctChange = this.customerGave - this.currentOrder.price;
        const feedback = document.getElementById('payment-feedback');

        if (this.collectedMoney === correctChange) {
            feedback.textContent = '✓ Правильно! Сдача верная!';
            feedback.className = 'feedback-success pulse';
            this.money += this.currentOrder.price;
            this.score += 25;
            this.updateStats();
            setTimeout(() => this.showResult(true), 1500);
        } else {
            feedback.textContent = `✗ Неправильно! Нужно ${correctChange}₽, а вы дали ${this.collectedMoney}₽`;
            feedback.className = 'feedback-error shake';
            this.collectedMoney = 0;
        }
    },

    // Показать результат обслуживания
    showResult(success) {
        this.showScreen('result-screen');
        this.totalCustomers++;
        
        if (success) {
            document.getElementById('result-title').textContent = '🎉 Отлично!';
            document.getElementById('result-message').textContent = 
                `Вы успешно обслужили клиента и заработали ${this.currentOrder.price}₽!`;
        } else {
            document.getElementById('result-title').textContent = '😔 Попробуйте еще раз';
            document.getElementById('result-message').textContent = 
                'Не все получилось, но продолжайте стараться!';
        }
    },

    // Следующий клиент
    nextCustomer() {
        this.customerNumber++;
        this.updateStats();
        this.showScreen('order-screen');
        this.startOrderPhase();
    },

    // Закончить игру
    endGame() {
        this.showScreen('end-screen');
        document.getElementById('final-customers').textContent = this.totalCustomers;
        document.getElementById('final-money').textContent = this.money;
        document.getElementById('final-score').textContent = this.score;
    }
};

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});
