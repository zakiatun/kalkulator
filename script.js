document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. NAVIGASI TAB (KALKULATOR VS BELAJAR SMK)
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const viewSections = document.querySelectorAll('.view-section');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            viewSections.forEach(sec => sec.classList.add('hidden'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // ==========================================
    // 2. LOGIKA KALKULATOR ALA PONSEL
    // ==========================================
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let shouldResetScreen = false;
    let calcHistory = [];

    const currentDisplay = document.getElementById('current-operand');
    const previousDisplay = document.getElementById('previous-operand');
    const historyToggle = document.getElementById('history-toggle');
    const historyDropdown = document.getElementById('history-dropdown');
    const clearHistoryBtn = document.getElementById('clear-history');

    function updateDisplay() {
        currentDisplay.textContent = formatNumber(currentOperand);
        if (operation != null) {
            previousDisplay.textContent = `${formatNumber(previousOperand)} ${operation}`;
        } else {
            previousDisplay.textContent = '';
        }
    }

    function formatNumber(numberStr) {
        if (numberStr === 'Error') return 'Error';
        const stringNumber = numberStr.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('id-ID', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    function appendNumber(number) {
        if (currentOperand === 'Error') currentOperand = '0';
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentOperand.includes('.')) return;
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            if (currentOperand.length >= 14) return;
            currentOperand += number;
        }
        updateDisplay();
    }

    function chooseOperation(op) {
        if (currentOperand === 'Error') return;
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            compute();
        }
        operation = op;
        previousOperand = currentOperand;
        shouldResetScreen = true;
        updateDisplay();
    }

    function compute() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    currentOperand = 'Error';
                    operation = undefined;
                    previousOperand = '';
                    updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        const finalResult = Math.round(computation * 100000000) / 100000000;
        addToHistory(`${formatNumber(prev)} ${operation} ${formatNumber(current)}`, formatNumber(finalResult));
        
        currentOperand = finalResult.toString();
        operation = undefined;
        previousOperand = '';
        shouldResetScreen = true;
        updateDisplay();
    }

    function handleScientific(type) {
        if (currentOperand === 'Error') return;
        const val = parseFloat(currentOperand);
        if (isNaN(val)) return;

        let res;
        let label;
        const toRad = (deg) => (deg * Math.PI) / 180;

        switch (type) {
            case 'sin':
                res = Math.round(Math.sin(toRad(val)) * 10000) / 10000;
                label = `sin(${val}°)`;
                break;
            case 'cos':
                res = Math.round(Math.cos(toRad(val)) * 10000) / 10000;
                label = `cos(${val}°)`;
                break;
            case 'tan':
                if (val % 180 === 90) {
                    currentOperand = 'Error';
                    updateDisplay();
                    return;
                }
                res = Math.round(Math.tan(toRad(val)) * 10000) / 10000;
                label = `tan(${val}°)`;
                break;
            case 'sqrt':
                if (val < 0) {
                    currentOperand = 'Error';
                    updateDisplay();
                    return;
                }
                res = Math.round(Math.sqrt(val) * 1000000) / 1000000;
                label = `√(${val})`;
                break;
            case 'pow':
                res = Math.round(Math.pow(val, 2) * 1000000) / 1000000;
                label = `(${val})²`;
                break;
        }

        addToHistory(label, formatNumber(res));
        currentOperand = res.toString();
        shouldResetScreen = true;
        updateDisplay();
    }

    function addToHistory(expression, result) {
        calcHistory.unshift({ expression, result });
        if (calcHistory.length > 15) calcHistory.pop();
        renderHistory();
    }

    function renderHistory() {
        historyToggle.textContent = `Riwayat (${calcHistory.length})`;
        if (calcHistory.length === 0) {
            historyDropdown.innerHTML = '<p class="empty-history">Belum ada riwayat perhitungan.</p>';
            return;
        }
        historyDropdown.innerHTML = calcHistory.map(item => `
            <div class="history-item">
                <span>${item.expression}</span>
                <strong>= ${item.result}</strong>
            </div>
        `).join('');
    }

    // Event Listeners Tombol Kalkulator
    document.querySelectorAll('[data-number]').forEach(btn => {
        btn.addEventListener('click', () => appendNumber(btn.getAttribute('data-number')));
    });

    document.querySelectorAll('[data-operator]').forEach(btn => {
        btn.addEventListener('click', () => chooseOperation(btn.getAttribute('data-operator')));
    });

    document.querySelectorAll('[data-sci]').forEach(btn => {
        btn.addEventListener('click', () => handleScientific(btn.getAttribute('data-sci')));
    });

    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action === 'clear') {
                currentOperand = '0';
                previousOperand = '';
                operation = undefined;
                updateDisplay();
            } else if (action === 'delete') {
                if (currentOperand === 'Error' || shouldResetScreen) {
                    currentOperand = '0';
                    shouldResetScreen = false;
                } else {
                    currentOperand = currentOperand.toString().slice(0, -1);
                    if (currentOperand === '' || currentOperand === '-') currentOperand = '0';
                }
                updateDisplay();
            } else if (action === 'percent') {
                if (currentOperand !== 'Error') {
                    currentOperand = (parseFloat(currentOperand) / 100).toString();
                    updateDisplay();
                }
            } else if (action === 'toggle-sign') {
                if (currentOperand !== '0' && currentOperand !== 'Error') {
                    currentOperand = (parseFloat(currentOperand) * -1).toString();
                    updateDisplay();
                }
            } else if (action === 'calculate') {
                compute();
            }
        });
    });

    // Dukungan Keyboard Fisik
    document.addEventListener('keydown', (e) => {
        const calcSection = document.getElementById('calculator-view');
        if (calcSection.classList.contains('hidden')) return;

        if ((e.key >= '0' && e.key <= '9') || e.key === '.') appendNumber(e.key);
        if (e.key === '+' || e.key === '-') chooseOperation(e.key);
        if (e.key === '*') chooseOperation('×');
        if (e.key === '/') {
            e.preventDefault();
            chooseOperation('÷');
        }
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            compute();
        }
        if (e.key === 'Backspace') {
            document.querySelector('[data-action="delete"]').click();
        }
        if (e.key === 'Escape') {
            document.querySelector('[data-action="clear"]').click();
        }
    });

    historyToggle.addEventListener('click', () => {
        historyDropdown.classList.toggle('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        calcHistory = [];
        renderHistory();
    });

    // ==========================================
    // 3. MODUL BELAJAR MATEMATIKA SMK
    // ==========================================
    const topicSelect = document.getElementById('math-topic');
    const topicTitle = document.getElementById('topic-title');
    const topicDesc = document.getElementById('topic-desc');
    const topicFormula = document.getElementById('topic-formula');
    const solverForm = document.getElementById('solver-form');
    const solverResult = document.getElementById('solver-result');
    const stepByStep = document.getElementById('step-by-step');

    const quizQuestion = document.getElementById('quiz-question');
    const quizUserAnswer = document.getElementById('quiz-user-answer');
    const checkQuizBtn = document.getElementById('check-quiz');
    const generateQuizBtn = document.getElementById('generate-quiz');
    const quizFeedback = document.getElementById('quiz-feedback');

    let currentQuizAnswer = 240000;

    const smkTopics = {
        'bunga-tunggal': {
            title: 'Bunga Tunggal (Matematika Keuangan)',
            desc: 'Menghitung besar bunga berdasarkan modal awal (M), suku bunga per tahun (i), dan lama menabung/pinjam dalam tahun (t).',
            formula: 'B = M × i × t  |  Total = M + B',
            inputs: [
                { id: 'input-1', label: 'Modal Awal M (Rp)', placeholder: 'Contoh: 1000000', step: 'any' },
                { id: 'input-2', label: 'Suku Bunga per Tahun (%)', placeholder: 'Contoh: 5', step: 'any' },
                { id: 'input-3', label: 'Jangka Waktu (Tahun)', placeholder: 'Contoh: 2', step: 'any' }
            ],
            solve: (vals) => {
                const [M, p, t] = vals;
                const i = p / 100;
                const B = M * i * t;
                const total = M + B;
                return `
                    <p><strong>Diketahui:</strong> M = Rp${M.toLocaleString('id-ID')}, i = ${p}% (${i}), t = ${t} tahun</p>
                    <p><strong>Langkah 1:</strong> B = ${M.toLocaleString('id-ID')} × ${i} × ${t}</p>
                    <p><strong>Besar Bunga (B):</strong> Rp${B.toLocaleString('id-ID')}</p>
                    <p><strong>Modal Akhir:</strong> Rp${total.toLocaleString('id-ID')}</p>
                `;
            },
            makeQuiz: () => {
                const m = (Math.floor(Math.random() * 5) + 1) * 1000000;
                const p = (Math.floor(Math.random() * 4) + 3) * 2;
                const t = Math.floor(Math.random() * 3) + 1;
                const ans = m * (p / 100) * t;
                return {
                    question: `Modal sebesar Rp${m.toLocaleString('id-ID')} ditabung dengan bunga tunggal ${p}% per tahun. Berapa besar bunga setelah ${t} tahun? (Masukkan angka tanpa titik)`,
                    answer: ans
                };
            }
        },
        'trigonometri': {
            title: 'Trigonometri Dasar (Segitiga Siku-Siku)',
            desc: 'Menentukan nilai perbandingan sinus, kosinus, dan tangen dari suatu sudut derajat pada segitiga siku-siku.',
            formula: 'sin α = Depan/Miring | cos α = Samping/Miring | tan α = Depan/Samping',
            inputs: [
                { id: 'input-1', label: 'Besar Sudut α (Derajat)', placeholder: 'Contoh: 30', step: 'any' },
                { id: 'input-2', label: 'Panjang Sisi Miring (cm)', placeholder: 'Contoh: 10', step: 'any' }
            ],
            solve: (vals) => {
                const [deg, miring] = vals;
                const rad = (deg * Math.PI) / 180;
                const sinVal = Math.round(Math.sin(rad) * 1000) / 1000;
                const cosVal = Math.round(Math.cos(rad) * 1000) / 1000;
                const depan = Math.round(miring * sinVal * 100) / 100;
                const samping = Math.round(miring * cosVal * 100) / 100;
                return `
                    <p><strong>Nilai Sudut:</strong> sin(${deg}°) = ${sinVal}, cos(${deg}°) = ${cosVal}</p>
                    <p><strong>Sisi Depan:</strong> ${miring} × sin(${deg}°) = <strong>${depan} cm</strong></p>
                    <p><strong>Sisi Samping:</strong> ${miring} × cos(${deg}°) = <strong>${samping} cm</strong></p>
                `;
            },
            makeQuiz: () => {
                const kasus = [
                    { q: 'Jika panjang sisi miring segitiga siku-siku adalah 20 cm dan sudut α = 30°, berapa panjang sisi di depan sudut α (cm)? (sin 30° = 0.5)', a: 10 },
                    { q: 'Jika panjang sisi miring adalah 16 cm dan sudut α = 60°, berapa panjang sisi di samping sudut α (cm)? (cos 60° = 0.5)', a: 8 },
                    { q: 'Diketahui tan 45° = 1. Jika sisi samping sudut 45° adalah 12 cm, berapa panjang sisi depannya (cm)?', a: 12 }
                ];
                const pick = kasus[Math.floor(Math.random() * kasus.length)];
                return { question: pick.q, answer: pick.a };
            }
        },
        'persamaan-kuadrat': {
            title: 'Akar Persamaan Kuadrat (Rumus ABC)',
            desc: 'Mencari akar-akar x₁ dan x₂ dari bentuk umum ax² + bx + c = 0 menggunakan diskriminan D = b² - 4ac.',
            formula: 'x₁,₂ = (-b ± √(b² - 4ac)) / 2a',
            inputs: [
                { id: 'input-1', label: 'Nilai Koefisien a (a ≠ 0)', placeholder: 'Contoh: 1', step: 'any' },
                { id: 'input-2', label: 'Nilai Koefisien b', placeholder: 'Contoh: -5', step: 'any' },
                { id: 'input-3', label: 'Nilai Konstanta c', placeholder: 'Contoh: 6', step: 'any' }
            ],
            solve: (vals) => {
                const [a, b, c] = vals;
                if (a === 0) return '<p>Nilai <strong>a</strong> tidak boleh 0 pada persamaan kuadrat.</p>';
                const D = (b * b) - (4 * a * c);
                if (D < 0) {
                    return `<p><strong>Diskriminan (D):</strong> ${D}</p><p>Karena D < 0, persamaan tidak memiliki akar real (akar imajiner).</p>`;
                }
                const x1 = Math.round(((-b + Math.sqrt(D)) / (2 * a)) * 100) / 100;
                const x2 = Math.round(((-b - Math.sqrt(D)) / (2 * a)) * 100) / 100;
                return `
                    <p><strong>Persamaan:</strong> ${a}x² + (${b})x + (${c}) = 0</p>
                    <p><strong>Diskriminan (D):</strong> (${b})² - 4(${a})(${c}) = ${D}</p>
                    <p><strong>Akar-akar:</strong> x₁ = <strong>${x1}</strong> dan x₂ = <strong>${x2}</strong></p>
                `;
            },
            makeQuiz: () => {
                const soal = [
                    { q: 'Tentukan nilai diskriminan (D = b² - 4ac) dari persamaan x² - 5x + 6 = 0:', a: 1 },
                    { q: 'Salah satu akar positif dari persamaan x² - 9 = 0 adalah:', a: 3 },
                    { q: 'Tentukan nilai diskriminan (D) dari persamaan x² + 4x + 4 = 0:', a: 0 }
                ];
                const pick = soal[Math.floor(Math.random() * soal.length)];
                return { question: pick.q, answer: pick.a };
            }
        },
        'barisan-aritmatika': {
            title: 'Barisan & Deret Aritmatika',
            desc: 'Menghitung suku ke-n (Un) dan jumlah n suku pertama (Sn) pada barisan bilangan dengan beda tetap (b).',
            formula: 'Un = a + (n - 1)b  |  Sn = n/2 × (a + Un)',
            inputs: [
                { id: 'input-1', label: 'Suku Pertama (a)', placeholder: 'Contoh: 3', step: 'any' },
                { id: 'input-2', label: 'Beda / Selisih (b)', placeholder: 'Contoh: 4', step: 'any' },
                { id: 'input-3', label: 'Suku ke-n yang dicari (n)', placeholder: 'Contoh: 10', step: '1' }
            ],
            solve: (vals) => {
                const [a, b, n] = vals;
                const un = a + (n - 1) * b;
                const sn = (n / 2) * (a + un);
                return `
                    <p><strong>Rumus Un:</strong> U${n} = ${a} + (${n} - 1) × ${b}</p>
                    <p><strong>Suku ke-${n} (U${n}):</strong> <strong>${un}</strong></p>
                    <p><strong>Jumlah ${n} Suku Pertama (S${n}):</strong> <strong>${sn}</strong></p>
                `;
            },
            makeQuiz: () => {
                const a = Math.floor(Math.random() * 5) + 2;
                const b = Math.floor(Math.random() * 4) + 2;
                const n = Math.floor(Math.random() * 5) + 5;
                const un = a + (n - 1) * b;
                return {
                    question: `Diketahui barisan aritmatika dengan suku pertama a = ${a} dan beda b = ${b}. Berapa nilai suku ke-${n} (U${n})?`,
                    answer: un
                };
            }
        }
    };

    function loadTopic(topicKey) {
        const data = smkTopics[topicKey];
        topicTitle.textContent = data.title;
        topicDesc.textContent = data.desc;
        topicFormula.textContent = data.formula;

        const inputsHtml = data.inputs.map(inp => `
            <div class="input-group">
                <label for="${inp.id}">${inp.label}</label>
                <input type="number" id="${inp.id}" step="${inp.step}" placeholder="${inp.placeholder}" required>
            </div>
        `).join('');

        solverForm.innerHTML = `${inputsHtml}<button type="submit" class="btn-primary">Hitung & Lihat Langkah</button>`;
        solverResult.classList.add('hidden');
        generateNewQuiz(topicKey);
    }

    function generateNewQuiz(topicKey) {
        const quizObj = smkTopics[topicKey].makeQuiz();
        quizQuestion.textContent = quizObj.question;
        currentQuizAnswer = quizObj.answer;
        quizUserAnswer.value = '';
        quizFeedback.textContent = '';
        quizFeedback.className = 'feedback-msg';
    }

    topicSelect.addEventListener('change', (e) => {
        loadTopic(e.target.value);
    });

    solverForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const topicKey = topicSelect.value;
        const inputs = solverForm.querySelectorAll('input');
        const values = Array.from(inputs).map(inp => parseFloat(inp.value));

        stepByStep.innerHTML = smkTopics[topicKey].solve(values);
        solverResult.classList.remove('hidden');
    });

    generateQuizBtn.addEventListener('click', () => {
        generateNewQuiz(topicSelect.value);
    });

    checkQuizBtn.addEventListener('click', () => {
        const userVal = parseFloat(quizUserAnswer.value);
        if (isNaN(userVal)) {
            quizFeedback.textContent = 'Masukkan angka jawaban terlebih dahulu.';
            quizFeedback.className = 'feedback-msg feedback-wrong';
            return;
        }

        if (Math.abs(userVal - currentQuizAnswer) < 0.01) {
            quizFeedback.textContent = 'Benar! Jawaban Anda tepat sekali.';
            quizFeedback.className = 'feedback-msg feedback-correct';
        } else {
            quizFeedback.textContent = `Belum tepat. Jawaban yang benar adalah ${currentQuizAnswer}.`;
            quizFeedback.className = 'feedback-msg feedback-wrong';
        }
    });

    // Inisialisasi topik awal
    loadTopic('bunga-tunggal');
});