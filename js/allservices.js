    fetch('../../shared/navbar/navbar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
      })
      .catch(error => console.error('خطأ في تحميل الناف بار:', error));

    fetch('../../shared/footer/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
      })


      
      .catch(error => console.error('خطأ في تحميل footer:', error));
        let sliderTrack = document.getElementById('sliderTrack');
        let isReverse = false;
        let currentSpeed = 15;

        function pauseSlider() {
            sliderTrack.style.animationPlayState = 'paused';
        }

        function playSlider() {
            sliderTrack.style.animationPlayState = 'running';
        }

        function reverseSlider() {
            isReverse = !isReverse;
            if (isReverse) {
                sliderTrack.style.animationDirection = 'reverse';
            } else {
                sliderTrack.style.animationDirection = 'normal';
            }
        }

        function changeSpeed(speed) {
            currentSpeed = speed;
            document.getElementById('speedValue').textContent = speed + 's';
            sliderTrack.style.animationDuration = speed + 's';
        }

        // Optional: Add keyboard controls
        document.addEventListener('keydown', function(event) {
            switch(event.key) {
                case ' ': // Spacebar
                    event.preventDefault();
                    if (sliderTrack.style.animationPlayState === 'paused') {
                        playSlider();
                    } else {
                        pauseSlider();
                    }
                    break;
                case 'ArrowLeft':
                    if (!isReverse) reverseSlider();
                    break;
                case 'ArrowRight':
                    if (isReverse) reverseSlider();
                    break;
            }
        });

        // Auto-restart animation when it completes (fallback)
        sliderTrack.addEventListener('animationend', function() {
            sliderTrack.style.animation = 'none';
            sliderTrack.offsetHeight; // Trigger reflow
            sliderTrack.style.animation = `slide ${currentSpeed}s linear infinite`;
        });