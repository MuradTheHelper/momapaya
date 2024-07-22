let wheel;
let foodItems = ['Nasi Liwet', 'Timlo Solo', 'Sate Kere', 'Serabi', 'Tengkleng', 'Selat Solo'];

function initWheel() {
    const canvas = document.getElementById('wheel');
    canvas.width = 500;  // Memperbesar ukuran canvas
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    wheel = new Wheel(ctx, canvas.width / 2, canvas.height / 2, canvas.width / 2 - 20, foodItems);
    wheel.draw();
    updateFoodList();
}
document.getElementById('spin-btn').addEventListener('click', () => {
    wheel.spin();
});

document.getElementById('add-food').addEventListener('click', addFood);

document.getElementById('new-food').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addFood();
    }
});

function addFood() {
    const newFood = document.getElementById('new-food').value.trim();
    if (newFood && !foodItems.includes(newFood)) {
        foodItems.push(newFood);
        document.getElementById('new-food').value = '';
        updateFoodList();
        wheel.updateItems(foodItems);
    }
}

function updateFoodList() {
    const foodList = document.getElementById('foods');
    foodList.innerHTML = '';
    foodItems.forEach((food, index) => {
        const li = document.createElement('li');
        li.textContent = food;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.onclick = () => removeFood(index);
        li.appendChild(deleteBtn);
        foodList.appendChild(li);
    });
}

function removeFood(index) {
    foodItems.splice(index, 1);
    updateFoodList();
    wheel.updateItems(foodItems);
}

class Wheel {
    constructor(ctx, x, y, radius, items) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.items = items;
        this.spinning = false;
        this.currentRotation = 0;
    }

    updateItems(newItems) {
        this.items = newItems;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const arc = 2 * Math.PI / this.items.length;

        for (let i = 0; i < this.items.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, i * arc + this.currentRotation, (i + 1) * arc + this.currentRotation);
            this.ctx.lineTo(this.x, this.y);
            this.ctx.fillStyle = `hsl(${i * 360 / this.items.length}, 70%, 60%)`;
            this.ctx.fill();
            
            this.ctx.save();
            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(i * arc + arc / 2 + this.currentRotation);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';  // Memperbesar ukuran font
            this.ctx.fillText(this.items[i], this.radius - 30, 5);
            this.ctx.restore();
        }
    }

    spin() {
        if (this.spinning) return;
        this.spinning = true;
        const totalRotation = 2 * Math.PI * (3 + Math.random());
        const duration = 5000;
        const start = performance.now();

        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeOutCubic(progress);
            
            this.currentRotation = easeProgress * totalRotation;
            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.spinning = false;
                this.showResult();
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    showResult() {
        const arc = 2 * Math.PI / this.items.length;
        const index = Math.floor(((this.currentRotation % (2 * Math.PI)) + arc / 2) / arc);
        const result = this.items[index];
        document.getElementById('food-result').textContent = `Anda akan makan ${result} hari ini!`;
        showMap(result);
    }
}

function initMap() {
    // Koordinat pusat kota Solo
    const soloCoords = [-7.5655, 110.8280];
    map = L.map('map').setView(soloCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function showMap(foodType) {
    if (!map) {
        initMap();
    }

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Simulasi pencarian restoran di Solo
    const dummyLocations = [
        { name: `Restoran ${foodType} Enak`, lat: -7.5655, lon: 110.8280 },
        { name: `Warung ${foodType} Murah`, lat: -7.5670, lon: 110.8300 },
        { name: `Café ${foodType} Populer`, lat: -7.5640, lon: 110.8260 }
    ];

    dummyLocations.forEach(loc => {
        L.marker([loc.lat, loc.lon]).addTo(map)
            .bindPopup(loc.name)
            .openPopup();
    });

    map.setView([dummyLocations[0].lat, dummyLocations[0].lon], 14);
}

window.onload = () => {
    initWheel();
    initMap();
};