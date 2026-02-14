// DevCoffee - Расширенная версия с полным функционалом
// Система звуков
const SoundSystem = {
    context: null,
    
    init() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
    },
    
    playSound(type) {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        switch(type) {
            case 'grind':
                oscillator.frequency.setValueAtTime(200, this.context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
                oscillator.type = 'sawtooth';
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.3);
                break;
            case 'brew':
                oscillator.frequency.setValueAtTime(400, this.context.currentTime);
                gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                oscillator.type = 'sine';
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.5);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(523.25, this.context.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, this.context.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.context.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.3);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(200, this.context.currentTime);
                oscillator.frequency.setValueAtTime(150, this.context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                oscillator.type = 'square';
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.2);
                break;
            case 'coin':
                oscillator.frequency.setValueAtTime(800, this.context.currentTime);
                oscillator.frequency.setValueAtTime(600, this.context.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.1);
                break;
            case 'timer':
                oscillator.frequency.setValueAtTime(440, this.context.currentTime);
                gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.05);
                break;
        }
    }
};

// Главный игровой объект
const game = {
    // Базовые данные
    money: 0,
    score: 0,
    day: 1,
    totalCustomers: 0,
    currentOrders: [],
    maxOrders: 3,
    
    // Прогрессия
    level: 1,
    experience: 0,
    combo: 0,
    maxCombo: 0,
    perfectOrders: 0,
    
    // Режим игры
    gameMode: 'normal', // normal, rush, evening, endless, challenge
    
    // Разблокированное
    unlockedDrinks: ['espresso', 'americano'],
    unlockedToppings: ['syrup_vanilla', 'cinnamon'],
    
    // Улучшения
    upgrades: {
        machineSpeed: 1,
        customerPatience: 1,
        tipsBonus: 1,
        decorLevel: 0
    },
    
    // Достижения
    achievements: {
        first_customer: false,
        speed_demon: false,
        perfectionist: false,
        rich: false,
        combo_master: false
    },

    drinks: {
        espresso: { name: 'Эспрессо', price: 120, steps: ['grind', 'tamp', 'brew'], level: 1 },
        americano: { name: 'Американо', price: 100, steps: ['grind', 'brew', 'add-water'], level: 1 },
        latte: { name: 'Латте', price: 180, steps: ['grind', 'brew', 'steam', 'pour-milk'], level: 3 },
        cappuccino: { name: 'Капучино', price: 160, steps: ['grind', 'brew', 'steam', 'add-foam'], level: 2 },
        mocha: { name: 'Мокка', price: 200, steps: ['grind', 'brew', 'add-chocolate', 'steam', 'pour-milk'], level: 5 },
        macchiato: { name: 'Макиато', price: 140, steps: ['grind', 'tamp', 'brew', 'add-foam'], level: 4 }
    },

    toppings: {
        syrup_vanilla: { name: 'Ванильный сироп', price: 30, icon: '🍯', step: 'add-syrup', level: 1 },
        syrup_caramel: { name: 'Карамельный сироп', price: 30, icon: '🍮', step: 'add-syrup', level: 2 },
        syrup_hazelnut: { name: 'Ореховый сироп', price: 30, icon: '🌰', step: 'add-syrup', level: 3 },
        whipped_cream: { name: 'Взбитые сливки', price: 40, icon: '🍦', step: 'add-cream', level: 2 },
        cinnamon: { name: 'Корица', price: 10, icon: '✨', step: 'add-spice', level: 1 },
        chocolate: { name: 'Шоколад', price: 35, icon: '🍫', step: 'add-chocolate', level: 2 }
    },

    customerTypes: {
        normal: { name: 'Обычный', patience: 60, tip: 1.0, emoji: '😊', chance: 0.6 },
        impatient: { name: 'Спешащий', patience: 40, tip: 1.5, emoji: '😰', chance: 0.2 },
        vip: { name: 'VIP', patience: 50, tip: 2.0, emoji: '😎', chance: 0.1 },
        patient: { name: 'Терпеливый', patience: 90, tip: 0.8, emoji: '😌', chance: 0.1 }
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

    randomEvents: [
        { id: 'machine_slow', name: 'Машина барахлит', effect: 'slow', duration: 3 },
        { id: 'rush_hour', name: 'Час пик!', effect: 'rush', duration: 2 },
        { id: 'celebrity', name: 'Знаменитость!', effect: 'vip', duration: 1 },
        { id: 'discount', name: 'Счастливые часы', effect: 'discount', duration: 2 }
    ],
    
    activeEvent: null,
    eventTimer: 0,

    // Инициализация
    init() {
        SoundSystem.init();
        this.loadProgress();
        this.setupEventListeners();
        this.updateAllUI();
    },

    // Сохранение и загрузка
    saveProgress() {
        const saveData = {
            money: this.money,
            level: this.level,
            experience: this.experience,
            totalCustomers: this.totalCustomers,
            maxCombo: this.maxCombo,
            unlockedDrinks: this.unlockedDrinks,
            unlockedToppings: this.unlockedToppings,
            upgrades: this.upgrades,
            achievements: this.achievements
        };
        localStorage.setItem('devCoffeeSave', JSON.stringify(saveData));
    },

    loadProgress() {
        const saveData = localStorage.getItem('devCoffeeSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.money = data.money || 0;
            this.level = data.level || 1;
            this.experience = data.experience || 0;
            this.totalCustomers = data.totalCustomers || 0;
            this.maxCombo = data.maxCombo || 0;
            this.unlockedDrinks = data.unlockedDrinks || ['espresso', 'americano'];
            this.unlockedToppings = data.unlockedToppings || ['syrup_vanilla', 'cinnamon'];
            this.upgrades = data.upgrades || { machineSpeed: 1, customerPatience: 1, tipsBonus: 1, decorLevel: 0 };
            this.achievements = data.achievements || {};
        }
    },

    // Начать игру с выбранным режимом
    startGame(mode = 'normal') {
        this.gameMode = mode;
        this.score = 0;
        this.day = 1;
        this.combo = 0;
        this.perfectOrders = 0;
        this.currentOrders = [];
        
        // Настройки режимов
        switch(mode) {
            case 'rush':
                this.maxOrders = 5;
                break;
            case 'evening':
                this.maxOrders = 2;
                break;
            case 'endless':
                this.maxOrders = 3;
                break;
            case 'challenge':
                this.maxOrders = 4;
                break;
            default:
                this.maxOrders = 3;
        }
        
        this.updateAllUI();
        this.showScreen('game-screen');
        this.addNewCustomer();
        this.startGameLoop();
    },

    // Игровой цикл
    startGameLoop() {
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        
        this.gameLoopInterval = setInterval(() => {
            // Обновление таймеров заказов
            this.currentOrders.forEach(order => {
                if (order.stage !== 'done' && order.timer > 0) {
                    order.timer -= 0.1;
                    if (order.timer <= 10 && order.timer > 9.9) {
                        SoundSystem.playSound('timer');
                    }
                    if (order.timer <= 0) {
                        this.failOrder(order);
                    }
                }
            });
            
            // Случайные события
            this.eventTimer--;
            if (this.eventTimer <= 0 && !this.activeEvent && Math.random() < 0.05) {
                this.triggerRandomEvent();
            }
            if (this.activeEvent && this.eventTimer <= 0) {
                this.endEvent();
            }
            
            // Добавление новых клиентов
            if (this.currentOrders.length < this.maxOrders && Math.random() < 0.02) {
                this.addNewCustomer();
            }
            
            this.updateOrdersUI();
        }, 100);
    },

    // Добавить нового клиента
    addNewCustomer() {
        // Выбор типа клиента
        const rand = Math.random();
        let customerType = 'normal';
        let cumulative = 0;
        for (let type in this.customerTypes) {
            cumulative += this.customerTypes[type].chance;
            if (rand < cumulative) {
                customerType = type;
                break;
            }
        }
        
        // Выбор напитка из разблокированных
        const availableDrinks = this.unlockedDrinks.filter(d => this.drinks[d]);
        const drinkKey = availableDrinks[Math.floor(Math.random() * availableDrinks.length)];
        const drink = this.drinks[drinkKey];
        
        // Выбор топпингов
        const availableToppings = this.unlockedToppings.filter(t => this.toppings[t]);
        const numToppings = Math.floor(Math.random() * Math.min(3, availableToppings.length + 1));
        const selectedToppings = [];
        const usedIndices = new Set();
        
        for (let i = 0; i < numToppings; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * availableToppings.length);
            } while (usedIndices.has(randomIndex));
            usedIndices.add(randomIndex);
            selectedToppings.push(availableToppings[randomIndex]);
        }
        
        // Рассчет цены
        let price = drink.price;
        selectedToppings.forEach(t => {
            price += this.toppings[t].price;
        });
        
        const order = {
            id: Date.now(),
            drinkKey: drinkKey,
            drink: drink.name,
            toppings: selectedToppings,
            price: price,
            steps: [...drink.steps],
            customerType: customerType,
            timer: this.customerTypes[customerType].patience * this.upgrades.customerPatience,
            maxTimer: this.customerTypes[customerType].patience * this.upgrades.customerPatience,
            stage: 'waiting', // waiting, preparing, serving, payment, done
            progress: 0,
            errors: 0
        };
        
        this.currentOrders.push(order);
        this.updateOrdersUI();
    },

    // Провалить заказ
    failOrder(order) {
        this.combo = 0;
        order.stage = 'done';
        SoundSystem.playSound('error');
        this.showNotification('❌ Клиент ушел!', 'error');
        
        setTimeout(() => {
            this.currentOrders = this.currentOrders.filter(o => o.id !== order.id);
            this.updateOrdersUI();
        }, 1000);
    },

    // Случайное событие
    triggerRandomEvent() {
        const event = this.randomEvents[Math.floor(Math.random() * this.randomEvents.length)];
        this.activeEvent = event;
        this.eventTimer = event.duration * 600; // duration in minutes * 60 sec * 10 ticks
        
        this.showNotification(`🎪 ${event.name}`, 'info');
        
        switch(event.effect) {
            case 'slow':
                // Машина медленнее
                break;
            case 'rush':
                // Больше клиентов
                for (let i = 0; i < 2; i++) {
                    this.addNewCustomer();
                }
                break;
            case 'vip':
                // VIP клиент
                break;
        }
    },

    endEvent() {
        this.activeEvent = null;
        this.showNotification('Событие завершено', 'info');
    },

    // Выбор заказа для работы
    selectOrder(orderId) {
        const order = this.currentOrders.find(o => o.id === orderId);
        if (!order) return;
        
        this.currentOrder = order;
        order.stage = 'preparing';
        this.showOrderScreen();
    },

    // Экран выбора напитка и топпингов
    showOrderScreen() {
        document.getElementById('modal-order').classList.add('active');
        
        // Заполнение UI
        const order = this.currentOrder;
        document.getElementById('modal-customer-type').textContent = 
            `${this.customerTypes[order.customerType].emoji} ${this.customerTypes[order.customerType].name}`;
        
        // Отображаем что нужно
        let orderText = `Хочу ${order.drink}`;
        if (order.toppings.length > 0) {
            orderText += ' с ' + order.toppings.map(t => this.toppings[t].name.toLowerCase()).join(', ');
        }
        document.getElementById('modal-order-text').textContent = orderText;
        
        // Меню напитков
        const menuContainer = document.getElementById('modal-menu-items');
        menuContainer.innerHTML = '';
        this.unlockedDrinks.forEach(drinkKey => {
            const drink = this.drinks[drinkKey];
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.dataset.drink = drinkKey;
            if (drinkKey === order.drinkKey) item.classList.add('correct');
            item.innerHTML = `
                <div class="pixel-icon">☕</div>
                <div>${drink.name}</div>
                <div class="price">${drink.price}₽</div>
            `;
            item.onclick = () => this.selectDrink(item, drinkKey);
            menuContainer.appendChild(item);
        });
        
        // Топпинги
        const toppingsContainer = document.getElementById('modal-toppings-list');
        toppingsContainer.innerHTML = '';
        this.unlockedToppings.forEach(toppingKey => {
            const topping = this.toppings[toppingKey];
            const item = document.createElement('div');
            item.className = 'topping-item';
            item.dataset.topping = toppingKey;
            if (order.toppings.includes(toppingKey)) item.classList.add('correct');
            item.innerHTML = `
                <div class="pixel-icon">${topping.icon}</div>
                <div>${topping.name.split(' ')[0]}</div>
                <div class="price">+${topping.price}₽</div>
            `;
            item.onclick = () => this.toggleTopping(item, toppingKey);
            toppingsContainer.appendChild(item);
        });
        
        this.selectedDrink = null;
        this.selectedToppings = [];
    },

    selectDrink(element, drinkKey) {
        document.querySelectorAll('#modal-menu-items .menu-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedDrink = drinkKey;
    },

    toggleTopping(element, toppingKey) {
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            this.selectedToppings = this.selectedToppings.filter(t => t !== toppingKey);
        } else {
            element.classList.add('selected');
            this.selectedToppings.push(toppingKey);
        }
    },

    confirmOrder() {
        const order = this.currentOrder;
        
        if (!this.selectedDrink) {
            this.showNotification('Выберите напиток!', 'error');
            return;
        }
        
        // Проверка
        const correctDrink = this.selectedDrink === order.drinkKey;
        const correctToppings = this.selectedToppings.sort().join(',') === order.toppings.sort().join(',');
        
        if (correctDrink && correctToppings) {
            SoundSystem.playSound('success');
            this.score += 10;
            document.getElementById('modal-order').classList.remove('active');
            this.startPreparation();
        } else {
            SoundSystem.playSound('error');
            order.errors++;
            this.showNotification('Неправильный заказ!', 'error');
        }
    },

    // Приготовление
    startPreparation() {
        const order = this.currentOrder;
        document.getElementById('modal-prepare').classList.add('active');
        
        document.getElementById('modal-prepare-name').textContent = order.drink;
        
        // Добавляем шаги топпингов
        const allSteps = [...order.steps];
        order.toppings.forEach(t => {
            allSteps.push(this.toppings[t].step);
        });
        
        const interactiveArea = document.getElementById('modal-interactive-cooking');
        interactiveArea.innerHTML = '';
        
        const icons = {
            'grind': '⚙️', 'tamp': '👇', 'brew': '☕', 'steam': '💨',
            'pour-milk': '🥛', 'add-foam': '🌊', 'add-water': '💧',
            'add-syrup': '🍯', 'add-cream': '🍦', 'add-spice': '✨', 'add-chocolate': '🍫'
        };
        
        // Перемешиваем шаги
        const shuffledIndices = allSteps.map((_, index) => index);
        this.shuffleArray(shuffledIndices);
        
        shuffledIndices.forEach(index => {
            const step = allSteps[index];
            const button = document.createElement('div');
            button.className = 'interactive-step';
            button.dataset.index = index;
            button.innerHTML = `<div class="step-icon">${icons[step]}</div>`;
            button.onclick = () => this.performStep(button, index);
            interactiveArea.appendChild(button);
        });
        
        this.currentStepIndex = 0;
        this.allSteps = allSteps;
        this.totalSteps = allSteps.length;
        
        document.getElementById('modal-progress-fill').style.width = '0%';
        document.getElementById('modal-machine-status').textContent = 'Выполняйте по порядку!';
    },

    performStep(button, stepIndex) {
        if (stepIndex !== this.currentStepIndex) {
            button.classList.add('shake');
            setTimeout(() => button.classList.remove('shake'), 300);
            SoundSystem.playSound('error');
            this.currentOrder.errors++;
            return;
        }
        
        button.classList.add('active');
        SoundSystem.playSound('brew');
        
        this.currentStepIndex++;
        const progress = (this.currentStepIndex / this.totalSteps) * 100;
        document.getElementById('modal-progress-fill').style.width = progress + '%';
        
        if (this.currentStepIndex === this.totalSteps) {
            document.getElementById('modal-machine-status').textContent = '✓ Готово!';
            this.score += 20;
            SoundSystem.playSound('success');
            
            setTimeout(() => {
                document.getElementById('modal-prepare').classList.remove('active');
                this.startServing();
            }, 1000);
        }
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    // Подача
    startServing() {
        document.getElementById('modal-serve').classList.add('active');
        
        const cup = document.getElementById('modal-coffee-cup');
        const zone = document.getElementById('modal-customer-zone');
        
        cup.style.transform = '';
        zone.classList.remove('drop-target');
        
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;
    },

    completeServing() {
        SoundSystem.playSound('success');
        this.score += 15;
        document.getElementById('modal-serve').classList.remove('active');
        this.startPayment();
    },

    // Оплата
    startPayment() {
        document.getElementById('modal-payment').classList.add('active');
        
        const order = this.currentOrder;
        document.getElementById('modal-payment-amount').textContent = order.price;
        
        const bills = [10, 50, 100, 200, 500, 1000, 2000, 5000];
        const suitableBills = bills.filter(bill => bill >= order.price);
        
        let customerAmount;
        if (suitableBills.length > 0 && Math.random() > 0.3) {
            customerAmount = suitableBills[Math.floor(Math.random() * suitableBills.length)];
        } else {
            const nextBill = bills.find(bill => bill > order.price);
            customerAmount = nextBill || order.price;
        }
        
        this.customerGave = customerAmount;
        document.getElementById('modal-customer-gave').textContent = this.customerGave;
        
        this.collectedMoney = 0;
        this.updatePaymentDisplay();
    },

    updatePaymentDisplay() {
        const change = this.customerGave - this.currentOrder.price;
        document.getElementById('modal-change-amount').textContent = change;
    },

    addMoney(value) {
        this.collectedMoney += value;
        SoundSystem.playSound('coin');
        this.updatePaymentDisplay();
    },

    confirmPayment() {
        const correctChange = this.customerGave - this.currentOrder.price;
        
        if (this.collectedMoney === correctChange) {
            SoundSystem.playSound('success');
            
            // Расчет бонусов
            const order = this.currentOrder;
            const tipMultiplier = this.customerTypes[order.customerType].tip * this.upgrades.tipsBonus;
            const isPerfect = order.errors === 0;
            
            let earned = order.price;
            if (isPerfect) {
                earned = Math.floor(earned * tipMultiplier);
                this.perfectOrders++;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            } else {
                this.combo = 0;
            }
            
            // Комбо бонус
            if (this.combo >= 5) {
                earned = Math.floor(earned * 1.5);
            }
            
            this.money += earned;
            this.score += 25;
            this.experience += 10;
            this.totalCustomers++;
            
            // Уровни
            if (this.experience >= this.level * 100) {
                this.levelUp();
            }
            
            order.stage = 'done';
            
            document.getElementById('modal-payment').classList.remove('active');
            
            this.showNotification(`+${earned}₽ ${isPerfect ? '⭐ Идеально!' : ''}`, 'success');
            
            setTimeout(() => {
                this.currentOrders = this.currentOrders.filter(o => o.id !== order.id);
                this.updateOrdersUI();
                this.checkAchievements();
                this.saveProgress();
            }, 500);
            
        } else {
            SoundSystem.playSound('error');
            this.showNotification('Неправильная сдача!', 'error');
            this.collectedMoney = 0;
        }
    },

    // Повышение уровня
    levelUp() {
        this.level++;
        this.experience = 0;
        SoundSystem.playSound('success');
        this.showNotification(`🎉 Уровень ${this.level}!`, 'success');
        
        // Разблокировка нового контента
        for (let drinkKey in this.drinks) {
            if (this.drinks[drinkKey].level === this.level && !this.unlockedDrinks.includes(drinkKey)) {
                this.unlockedDrinks.push(drinkKey);
                this.showNotification(`🆕 Разблокирован ${this.drinks[drinkKey].name}!`, 'info');
            }
        }
        
        for (let toppingKey in this.toppings) {
            if (this.toppings[toppingKey].level === this.level && !this.unlockedToppings.includes(toppingKey)) {
                this.unlockedToppings.push(toppingKey);
                this.showNotification(`🆕 Разблокирован ${this.toppings[toppingKey].name}!`, 'info');
            }
        }
    },

    // Достижения
    checkAchievements() {
        if (this.totalCustomers >= 1 && !this.achievements.first_customer) {
            this.achievements.first_customer = true;
            this.showNotification('🏆 Достижение: Первый клиент!', 'achievement');
        }
        if (this.combo >= 10 && !this.achievements.combo_master) {
            this.achievements.combo_master = true;
            this.showNotification('🏆 Достижение: Мастер комбо!', 'achievement');
        }
        if (this.perfectOrders >= 50 && !this.achievements.perfectionist) {
            this.achievements.perfectionist = true;
            this.showNotification('🏆 Достижение: Перфекционист!', 'achievement');
        }
        if (this.money >= 10000 && !this.achievements.rich) {
            this.achievements.rich = true;
            this.showNotification('🏆 Достижение: Богач!', 'achievement');
        }
    },

    // Улучшения
    buyUpgrade(type) {
        const costs = {
            machineSpeed: this.upgrades.machineSpeed * 500,
            customerPatience: this.upgrades.customerPatience * 800,
            tipsBonus: this.upgrades.tipsBonus * 1000,
            decorLevel: (this.upgrades.decorLevel + 1) * 300
        };
        
        if (this.money >= costs[type]) {
            this.money -= costs[type];
            this.upgrades[type]++;
            SoundSystem.playSound('coin');
            this.showNotification('✓ Улучшение куплено!', 'success');
            this.updateUpgradesUI();
            this.saveProgress();
        } else {
            this.showNotification('Недостаточно денег!', 'error');
        }
    },

    // UI обновления
    updateAllUI() {
        document.getElementById('money').textContent = this.money;
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('combo').textContent = this.combo;
        
        const expProgress = (this.experience / (this.level * 100)) * 100;
        document.getElementById('exp-bar').style.width = expProgress + '%';
        
        // Обновление статистики
        if (document.getElementById('stat-customers')) {
            document.getElementById('stat-customers').textContent = this.totalCustomers;
        }
        if (document.getElementById('stat-combo')) {
            document.getElementById('stat-combo').textContent = this.maxCombo;
        }
        if (document.getElementById('stat-perfect')) {
            document.getElementById('stat-perfect').textContent = this.perfectOrders;
        }
        if (document.getElementById('stat-money')) {
            document.getElementById('stat-money').textContent = this.money;
        }
        
        // Обновление достижений
        if (document.getElementById('achievements-list')) {
            const achievementsList = document.getElementById('achievements-list');
            achievementsList.innerHTML = '';
            const achievementNames = {
                first_customer: '☕ Первый клиент',
                speed_demon: '⚡ Скоростной демон',
                perfectionist: '⭐ Перфекционист',
                rich: '💰 Богач',
                combo_master: '🔥 Мастер комбо'
            };
            for (let key in this.achievements) {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.background = this.achievements[key] ? '#27ae60' : '#7f8c8d';
                div.style.border = '2px solid #1a252f';
                div.style.margin = '5px 0';
                div.textContent = achievementNames[key] + (this.achievements[key] ? ' ✓' : ' 🔒');
                achievementsList.appendChild(div);
            }
        }
        
        this.updateUpgradesUI();
    },

    updateOrdersUI() {
        const container = document.getElementById('orders-queue');
        container.innerHTML = '';
        
        this.currentOrders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order-card';
            if (order.stage === 'done') orderDiv.classList.add('done');
            
            const timerPercent = (order.timer / order.maxTimer) * 100;
            let timerColor = '#27ae60';
            if (timerPercent < 30) timerColor = '#e74c3c';
            else if (timerPercent < 60) timerColor = '#f39c12';
            
            orderDiv.innerHTML = `
                <div class="order-header">
                    <span>${this.customerTypes[order.customerType].emoji}</span>
                    <span>${order.drink}</span>
                </div>
                <div class="order-timer" style="background: ${timerColor}; width: ${timerPercent}%"></div>
                <button class="pixel-button small" onclick="game.selectOrder(${order.id})">
                    ${order.stage === 'waiting' ? 'Принять' : 'Продолжить'}
                </button>
            `;
            
            container.appendChild(orderDiv);
        });
        
        this.updateAllUI();
    },

    updateUpgradesUI() {
        if (document.getElementById('upgrade-machine')) {
            document.getElementById('upgrade-machine').textContent = this.upgrades.machineSpeed;
            document.getElementById('upgrade-patience').textContent = this.upgrades.customerPatience;
            document.getElementById('upgrade-tips').textContent = this.upgrades.tipsBonus.toFixed(1);
            document.getElementById('upgrade-decor').textContent = this.upgrades.decorLevel;
        }
    },

    showNotification(text, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = text;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Управление экранами
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },

    // Event listeners
    setupEventListeners() {
        // Drag and drop для подачи
        const cup = document.getElementById('modal-coffee-cup');
        const zone = document.getElementById('modal-customer-zone');
        
        let isDragging = false;
        let startX, startY;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;

        cup.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - this.dragCurrentX;
            startY = e.clientY - this.dragCurrentY;
            cup.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            this.dragCurrentX = e.clientX - startX;
            this.dragCurrentY = e.clientY - startY;
            
            cup.style.transform = `translate(${this.dragCurrentX}px, ${this.dragCurrentY}px)`;

            const cupRect = cup.getBoundingClientRect();
            const zoneRect = zone.getBoundingClientRect();
            
            if (this.checkOverlap(cupRect, zoneRect)) {
                zone.classList.add('drop-target');
            } else {
                zone.classList.remove('drop-target');
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            cup.classList.remove('dragging');

            const cupRect = cup.getBoundingClientRect();
            const zoneRect = zone.getBoundingClientRect();

            if (this.checkOverlap(cupRect, zoneRect)) {
                zone.classList.remove('drop-target');
                this.completeServing();
            } else {
                this.dragCurrentX = 0;
                this.dragCurrentY = 0;
                cup.style.transform = '';
                zone.classList.remove('drop-target');
            }
        });
    },

    checkOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    },

    endGame() {
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        this.saveProgress();
        this.showScreen('welcome-screen');
    }
};

// Запуск при загрузке
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});
