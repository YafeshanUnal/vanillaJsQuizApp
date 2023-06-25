class QuizApp {
	constructor() {
		this.welcomeScreen = document.querySelector(".welcome-screen");
		this.startButton = document.querySelector(".start-button");
		this.quiz = document.querySelector(".quiz");
		this.previousButton = document.querySelector(".previous-question");
		this.nextButton = document.querySelector(".next-question");
		this.hintButton = document.querySelector(".hint-button");
		this.hintElement = document.querySelector(".hint");
		this.halfButton = document.querySelector(".half-button");
		this.showResultButton = document.querySelector(".show-result");
		this.resultScreen = document.querySelector(".result-screen");

		this.currentQuestionIndex = 0;
		this.hintCount = 0;
		this.halfCount = 0;

		this.startButton.addEventListener("click", () => this.startQuiz());
		this.hintButton.addEventListener("click", () => this.hint());
		this.halfButton.addEventListener("click", () => this.half());
		this.showResultButton.addEventListener("click", () => this.showResult());
		this.previousButton.addEventListener("click", () =>
			this.showPreviousQuestion()
		);
		this.nextButton.addEventListener("click", () => this.showNextQuestion());
		const restartButtons = document.querySelectorAll(".restart-button");
		restartButtons.forEach((button) => {
			button.addEventListener("click", () => {
				window.location.reload();
			});
		});

		this.allQuestions = getQuestions();

		const easyQuestions = this.allQuestions.filter(
			(question) => question.difficulty === "easy"
		);
		const mediumQuestions = this.allQuestions.filter(
			(question) => question.difficulty === "medium"
		);
		const hardQuestions = this.allQuestions.filter(
			(question) => question.difficulty === "hard"
		);

		const selectedQuestions = [
			...getRandomQuestions(easyQuestions, 2),
			...getRandomQuestions(mediumQuestions, 2),
			...getRandomQuestions(hardQuestions, 1),
		];

		function getRandomQuestions(questions, count) {
			const randomQuestions = [];
			const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
			for (let i = 0; i < count && i < shuffledQuestions.length; i++) {
				randomQuestions.push(shuffledQuestions[i]);
			}
			return randomQuestions;
		}

		this.allQuestions = selectedQuestions;
		this.selectedAnswers = [];
		this.hintAnswers = [];
	}

	startQuiz() {
		this.welcomeScreen.style.display = "none";
		this.quiz.style.display = "block";
		this.previousButton.style.display = "none";
		this.updateQuestion();
	}

	hint() {
		if (this.hintCount >= 2) {
			this.hintButton.disabled = true;
		} else {
			const currentQuestion = this.allQuestions[this.currentQuestionIndex];
			this.hintAnswers[this.currentQuestionIndex] = currentQuestion.hint;
			const hint = this.hintAnswers[this.currentQuestionIndex];
			this.hintElement.innerHTML = `${hint}`;
			this.hintCount++;
			this.hintButton.disabled = true;
		}
	}

	half() {
		if (this.halfCount >= 2) {
			this.halfButton.disabled = true;
		} else {
			const currentQuestion = this.allQuestions[this.currentQuestionIndex];
			const answerOptions = currentQuestion.answer;
			const correctAnswer = currentQuestion.correctAnswer;
			const halfOptions = answerOptions.filter(
				(option) => option !== correctAnswer
			);
			const randomOptions = [];
			while (randomOptions.length < 2) {
				const randomIndex = Math.floor(Math.random() * halfOptions.length);
				const randomOption = halfOptions[randomIndex];
				if (!randomOptions.includes(randomOption)) {
					randomOptions.push(randomOption);
				}
			}
			const optionLabels = document.querySelectorAll(".quiz-options label");
			optionLabels.forEach((label) => {
				const optionValue = label.innerText;
				if (randomOptions.includes(optionValue)) {
					label.style.display = "none";
				} else {
					label.style.display = "block";
				}
			});
			this.halfCount++;
			this.halfButton.disabled = true;
		}
	}

	previousQuestionUtil() {
		this.hintElement.innerHTML = "";
		if (this.currentQuestionIndex === 1) {
			this.previousButton.style.display = "none";
		}
	}
	showPreviousQuestion() {
		this.previousQuestionUtil();
		const selectedOption = document.querySelector(
			'input[name="answer"]:checked'
		);
		if (selectedOption) {
			this.selectedAnswers[this.currentQuestionIndex] = selectedOption.value;
		}
		if (this.currentQuestionIndex > 0) {
			this.currentQuestionIndex--;
			this.updateQuestion();
		} else {
			this.quiz.style.display = "none";
		}
	}

	nextQuestionUtil() {
		this.hintElement.innerHTML = "";
		this.previousButton.style.display = "block";
		this.hintCount !== 2 && (this.hintButton.disabled = false);
		this.halfCount !== 2 && (this.halfButton.disabled = false);
		const optionLabels = document.querySelectorAll(".quiz-options label");
		optionLabels.forEach((label) => {
			label.style.display = "block";
		});
	}
	showNextQuestion() {
		this.nextQuestionUtil();
		const selectedOption = document.querySelector(
			'input[name="answer"]:checked'
		);
		if (selectedOption) {
			this.selectedAnswers[this.currentQuestionIndex] = selectedOption.value;
		}
		if (this.currentQuestionIndex < this.allQuestions.length - 1) {
			this.currentQuestionIndex++;
			this.updateQuestion();
		} else {
			this.quiz.style.display = "none";
			this.showResultButton.style.display = "block";
		}
	}

	updateQuestion() {
		const questionElement = document.querySelector(".quiz-question");
		const currentQuestion = this.allQuestions[this.currentQuestionIndex];
		questionElement.innerHTML = `Soru ${this.currentQuestionIndex + 1}: ${
			currentQuestion.question
		}
        <br>
		(${currentQuestion.difficulty}) (${currentQuestion.points} points)`;

		this.updateOptions();
	}

	updateOptions() {
		const quizOptions = document.querySelector(".quiz-options");
		const answerOptions = this.allQuestions[this.currentQuestionIndex].answer;
		quizOptions.innerHTML = ""; // Mevcut seçenekleri temizle

		answerOptions.forEach((optionValue) => {
			const selectedAnswer = this.selectedAnswers[this.currentQuestionIndex];
			const isChecked = optionValue === selectedAnswer;

			const label = document.createElement("label");
			label.innerHTML = `
				<input type="radio" name="answer" value="${optionValue}" ${
				isChecked ? "checked" : ""
			}>
				${optionValue}
			`;

			quizOptions.appendChild(label);
		});
	}

	showResult() {
		this.resultScreen.style.display = "block";
		this.showResultButton.style.display = "none";
		const resultText = document.querySelector(".result-text");
		// Quiz sonucunu hesapla
		const totalPoints = this.calculateTotalPoints();
		const resultMessage = this.getResultMessage(totalPoints);
		// Sonuç metnini güncelle
		resultText.textContent = `${totalPoints} points! ${resultMessage}`;
		this.checkAnswers();
	}

	checkAnswers() {
		const resultOptions = document.querySelector(".result-options");

		this.allQuestions.forEach((question, index) => {
			const selectedAnswer = this.selectedAnswers[index] || "Empty";
			const correctAnswer = question.correctAnswer;
			const label = document.createElement("label");

			if (selectedAnswer === correctAnswer) {
				// Doğru cevap, yeşil renkte gösterilir
				label.style.color = "green";
			} else if (selectedAnswer === "Empty") {
				// Boş cevap, sarı renkte gösterilir
				label.style.color = "yellow";
			} else {
				// Yanlış cevap, kırmızı renkte gösterilir
				label.style.color = "red";
			}

			label.innerHTML = `Soru ${index + 1}: ${
				question.question
			} <br> Your Answer: ${selectedAnswer} (Correct Answer: ${correctAnswer})  <br> <br>`;
			resultOptions.appendChild(label);
		});
	}

	calculateTotalPoints() {
		let totalPoints = 0;

		// Cevapları kontrol et ve puanları topla
		for (let i = 0; i < this.selectedAnswers.length; i++) {
			const selectedAnswer = this.selectedAnswers[i];
			const currentQuestion = this.allQuestions[i];

			if (selectedAnswer === currentQuestion.correctAnswer) {
				totalPoints += currentQuestion.points;
			}
		}

		return totalPoints;
	}

	getResultMessage(totalPoints) {
		// Sonuç mesajını oluştur
		let resultMessage = "";

		if (totalPoints >= 80) {
			resultMessage = "Congratulations! You did a great job!";
		} else if (totalPoints >= 60) {
			resultMessage = "Good job!";
		} else if (totalPoints >= 40) {
			resultMessage = "You can do better!";
		} else {
			resultMessage = "You need to work harder!";
		}

		return resultMessage;
	}
}

getQuestions = () => {
	return [
		{
			question: "What is the capital of Turkey?",
			answer: ["Ankara", "Istanbul", "Izmir", "Bursa"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Ankara",
			hint: "It is located in the central part of the country.",
		},
		{
			question: "What is the capital of France?",
			answer: ["Paris", "Lyon", "Marseille", "Toulouse"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Paris",
			hint: "It is known as the 'City of Love' and has a famous tower.",
		},
		{
			question: "What is the capital of Germany?",
			answer: ["Berlin", "Hamburg", "Munich", "Cologne"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Berlin",
			hint: "It used to be divided into East and West.",
		},
		{
			question: "What is the capital of Italy?",
			answer: ["Rome", "Milan", "Naples", "Turin"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Rome",
			hint: "It is home to the Colosseum and the Vatican.",
		},
		{
			question: "What is the capital of Spain?",
			answer: ["Madrid", "Barcelona", "Valencia", "Seville"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Madrid",
			hint: "It is located in the heart of Spain.",
		},
		{
			question: "What is the capital of Portugal?",
			answer: ["Lisbon", "Porto", "Coimbra", "Braga"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Lisbon",
			hint: "It is situated on the western coast of the country.",
		},
		{
			question: "What is the capital of Greece?",
			answer: ["Athens", "Thessaloniki", "Patras", "Heraklion"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Athens",
			hint: "It is known as the birthplace of democracy.",
		},
		{
			question: "What is the capital of Sweden?",
			answer: ["Stockholm", "Gothenburg", "Malmo", "Uppsala"],
			difficulty: "easy",
			points: 15,
			correctAnswer: "Stockholm",
			hint: "It is spread across 14 islands.",
		},
		// 8 questions for medium difficulty
		{
			question: "What is the capital of Poland?",
			answer: ["Warsaw", "Krakow", "Wroclaw", "Poznan"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Warsaw",
			hint: "It starts with the letter 'W' and is the largest city in Poland.",
		},
		{
			question: "What is the capital of Romania?",
			answer: ["Bucharest", "Cluj-Napoca", "Timisoara", "Iasi"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Bucharest",
			hint: "It is often called 'Little Paris' due to its architecture.",
		},
		{
			question: "What is the capital of Ukraine?",
			answer: ["Kiev", "Kharkiv", "Odessa", "Dnipro"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Kiev",
			hint: "It is located on the Dnieper River and is the largest city in Ukraine.",
		},
		{
			question: "What is the capital of Russia?",
			answer: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Moscow",
			hint: "It is the political and economic center of Russia.",
		},
		{
			question: "What is the capital of Norway?",
			answer: ["Oslo", "Bergen", "Trondheim", "Stavanger"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Oslo",
			hint: "It is situated at the end of a fjord and is known for its Viking history.",
		},
		{
			question: "What is the capital of Finland?",
			answer: ["Helsinki", "Espoo", "Tampere", "Vantaa"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Helsinki",
			hint: "It is located on the southern coast of the country.",
		},
		{
			question: "What is the capital of Denmark?",
			answer: ["Copenhagen", "Aarhus", "Odense", "Aalborg"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Copenhagen",
			hint: "It is known for its colorful harbor and iconic statue of a mermaid.",
		},
		{
			question: "What is the capital of Belarus?",
			answer: ["Minsk", "Gomel", "Mogilev", "Vitebsk"],
			difficulty: "medium",
			points: 20,
			correctAnswer: "Minsk",
			hint: "It is situated on the Svislach and Nyamiha rivers.",
		},
		// 4 questions for hard difficulty
		{
			question: "What is the capital of Kazakhstan?",
			answer: ["Nur-Sultan", "Almaty", "Karaganda", "Shymkent"],
			difficulty: "hard",
			points: 30,
			correctAnswer: "Nur-Sultan",
			hint: "It used to be known as Astana and is the second coldest capital in the world.",
		},
		{
			question: "What is the capital of Uzbekistan?",
			answer: ["Tashkent", "Samarkand", "Bukhara", "Nukus"],
			difficulty: "hard",
			points: 30,
			correctAnswer: "Tashkent",
			hint: "It is located in the northeastern part of the country and is the largest city in Central Asia.",
		},
		{
			question: "What is the capital of Turkmenistan?",
			answer: ["Ashgabat", "Turkmenabat", "Dashoguz", "Mary"],
			difficulty: "hard",
			points: 30,
			correctAnswer: "Ashgabat",
			hint: "It is known for its white marble buildings and extravagant architecture.",
		},
		{
			question: "What is the capital of Tajikistan?",
			answer: ["Dushanbe", "Khujand", "Kulob", "Qurghonteppa"],
			difficulty: "hard",
			points: 30,
			correctAnswer: "Dushanbe",
			hint: "It is located in the western part of the country and its name means 'Monday' in Tajik.",
		},
	];
};

const quizApp = new QuizApp();
