// Игровой движок DevCoffee
const game = {
    money: 0,
    score: 0,
    customerNumber: 1,
    currentOrder: null,
    totalCustomers: 0,

    drinks: {
        espresso: { name: 'Эспрессо', price: 120, steps: ['Намолоть кофе', 'Утрамбовать', 'Пролить эспрессо'] },
        latte: { name: 'Латте', price: 180, steps: ['Намолоть кофе', 'Пролить эспрессо', 'Взбить молоко', 'Влить молоко'] },
        cappuccino: { name: 'Капучино', price: 160, steps: ['Намолоть кофе', 'Пролить эспрессо', 'Взбить молоко', 'Добавить пену'] },
        americano: { name: 'Американо', price: 100, steps: ['Намолоть кофе', 'Пролить эспрессо', 'Добавить горячую воду'] }
    },

    // Инициализация игры
    init() {
        console.log('DevCoffee загружена');
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
        this.currentOrder = {
            drink: randomDrink,
            name: this.drinks[randomDrink].name,
            price: this.drinks[randomDrink].price,
            steps: [...this.drinks[randomDrink].steps]
        };

        document.getElementById('customer-speech').textContent = 
            `Здравствуйте! Я хочу ${this.currentOrder.name}, пожалуйста!`;
        document.getElementById('order-feedback').textContent = '';
        document.getElementById('order-feedback').className = '';
    },

    setupEventListeners() {
        // Обработка выбора напитка
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectDrink(e.currentTarget));
        });

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
        const selectedDrink = element.dataset.drink;
        const feedback = document.getElementById('order-feedback');

        if (selectedDrink === this.currentOrder.drink) {
            feedback.textContent = '✓ Отлично! Вы правильно приняли заказ!';
            feedback.className = 'feedback-success pulse';
            this.score += 10;
            this.updateStats();
            setTimeout(() => this.startPreparationPhase(), 1500);
        } else {
            feedback.textContent = '✗ Неправильный напиток! Попробуйте еще раз.';
            feedback.className = 'feedback-error shake';
            element.classList.add('shake');
            setTimeout(() => element.classList.remove('shake'), 300);
        }
    },

    // === МИНИ-ИГРА 2: ПРИГОТОВИТЬ ЗАКАЗ ===
    startPreparationPhase() {
        this.showScreen('prepare-screen');
        document.getElementById('current-order-name').textContent = this.currentOrder.name;
        
        const stepsContainer = document.getElementById('preparation-steps');
        stepsContainer.innerHTML = '';
        
        this.currentOrder.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'prep-step';
            stepDiv.dataset.step = index;
            stepDiv.textContent = `${index + 1}. ${step}`;
            stepDiv.addEventListener('click', () => this.completeStep(stepDiv, index));
            stepsContainer.appendChild(stepDiv);
        });

        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('machine-status').textContent = 'Выполните все шаги по порядку';
        
        this.currentStepIndex = 0;
    },

    completeStep(stepElement, stepIndex) {
        if (stepIndex !== this.currentStepIndex) {
            stepElement.classList.add('shake');
            setTimeout(() => stepElement.classList.remove('shake'), 300);
            document.getElementById('machine-status').textContent = 'Выполняйте шаги по порядку!';
            return;
        }

        stepElement.classList.add('completed');
        this.currentStepIndex++;
        
        const progress = (this.currentStepIndex / this.currentOrder.steps.length) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        if (this.currentStepIndex === this.currentOrder.steps.length) {
            document.getElementById('machine-status').textContent = '✓ Заказ готов!';
            this.score += 20;
            this.updateStats();
            setTimeout(() => this.startServePhase(), 1500);
        } else {
            document.getElementById('machine-status').textContent = 
                `Шаг ${this.currentStepIndex + 1}: ${this.currentOrder.steps[this.currentStepIndex]}`;
        }
    },

    // === МИНИ-ИГРА 3: ОТДАТЬ ЗАКАЗ ===
    startServePhase() {
        this.showScreen('serve-screen');
        
        const coffeeCup = document.getElementById('coffee-cup');
        const customerZone = document.getElementById('customer-zone');
        
        // Сброс позиции
        coffeeCup.style.transform = '';
        customerZone.classList.remove('drop-target');
    },

    setupDragAndDrop() {
        const coffeeCup = document.getElementById('coffee-cup');
        const customerZone = document.getElementById('customer-zone');
        
        let isDragging = false;
        let startX, startY, currentX = 0, currentY = 0;

        coffeeCup.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            coffeeCup.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            
            coffeeCup.style.transform = `translate(${currentX}px, ${currentY}px)`;

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
                currentX = 0;
                currentY = 0;
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
        
        document.getElementById('payment-amount').textContent = this.currentOrder.price;
        
        // Клиент дает случайную сумму (точную или больше)
        const amounts = [this.currentOrder.price, 200, 500, 1000];
        this.customerGave = amounts[Math.floor(Math.random() * amounts.length)];
        
        if (this.customerGave < this.currentOrder.price) {
            this.customerGave = this.currentOrder.price;
        }
        
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
