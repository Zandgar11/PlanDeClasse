let wallMode = false; // Indicateur pour le mode de dessin de murs

// Fonction pour afficher la bonne section lorsque l'on clique sur le menu
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.classList.remove('active'));

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// Fonction pour créer la grille
function createGrid() {
    const gridSizeX = document.getElementById('cols').value; // Colonnes
    const gridSizeY = document.getElementById('rows').value; // Lignes
    const classroomGrid = document.getElementById('classroom-grid');
    classroomGrid.innerHTML = ''; // Réinitialiser la grille

    for (let i = 0; i < gridSizeY * gridSizeX; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.position = i; // Attribuer un identifiant de position

        // Événements pour le clic sur la cellule
        cell.addEventListener('click', () => {
            if (wallMode) {
                // Placer un mur si le mode est activé
                placeElement(cell, "Mur");
            }
        });

        // Événements pour le glisser-déposer
        cell.addEventListener('dragover', (event) => {
            event.preventDefault(); // Autoriser le dépôt
        });

        cell.addEventListener('drop', (event) => {
            const elementType = event.dataTransfer.getData('text/plain');
            placeElement(cell, elementType); // Placer l'élément dans la cellule
        });

        classroomGrid.appendChild(cell);
    }

    // Mettre à jour le style de la grille
    classroomGrid.style.gridTemplateColumns = `repeat(${gridSizeX}, 40px)`; // Mise à jour des colonnes
    classroomGrid.style.gridTemplateRows = `repeat(${gridSizeY}, 40px)`; // Mise à jour des lignes
}

// Placer un élément dans la cellule sélectionnée
function placeElement(cell, elementType) {
    // Supprimer toutes les classes existantes
    cell.classList.remove('eleve', 'mur', 'bureau');

    // Ajouter la classe correspondant au type d'élément
    if (elementType === "Bureau") {
        cell.classList.add('bureau');
        cell.innerText = 'Bureau'; // Placer le texte du bureau
    } else if (elementType === "Mur") {
        cell.classList.add('mur');
        cell.innerText = 'Mur'; // Placer le texte du mur
    } else {
        cell.classList.add('eleve');
        cell.innerText = elementType; // Placer le nom de l'élève
    }
}

// Gérer le début du glisser
function drag(event) {
    event.dataTransfer.setData('text/plain', event.target.innerText); // Enregistrer le nom de l'élément
}

// Fonction pour modifier le nom d'un élève
function modifyStudentName(element) {
    const newName = prompt("Entrez le nouveau nom de l'élève :", element.innerText);
    if (newName) {
        element.innerText = newName; // Mettre à jour le nom de l'élève
    }
}

// Ajouter un événement de clic sur les élèves pour les modifier
document.querySelectorAll('.student').forEach(student => {
    student.addEventListener('click', () => modifyStudentName(student)); // Événement pour modifier le nom
});

// Sauvegarder le plan de classe dans le localStorage
function saveClassroom() {
    const classroomGrid = document.getElementById('classroom-grid');
    const gridData = [];

    classroomGrid.querySelectorAll('.cell').forEach(cell => {
        gridData.push({
            position: cell.dataset.position,
            type: cell.innerText
        });
    });

    localStorage.setItem('classroomData', JSON.stringify(gridData)); // Enregistrer dans le localStorage
    alert('Plan de classe sauvegardé !');
}

// Charger le plan de classe depuis le localStorage
function loadClassroom() {
    const gridData = JSON.parse(localStorage.getItem('classroomData'));

    if (gridData) {
        gridData.forEach(data => {
            const cell = document.querySelector(`.cell[data-position="${data.position}"]`);
            if (cell) {
                cell.innerText = data.type;
                if (data.type.includes("Bureau")) {
                    cell.classList.add('bureau');
                } else if (data.type.includes("Mur")) {
                    cell.classList.add('mur');
                } else {
                    cell.classList.add('eleve');
                }
            }
        });
    }
}

// Effacer la grille
function clearGrid() {
    const classroomGrid = document.getElementById('classroom-grid');
    classroomGrid.innerHTML = ''; // Réinitialiser la grille
    createGrid(); // Recréer la grille
}

// Activer ou désactiver le mode de dessin des murs
function toggleWallMode() {
    wallMode = !wallMode; // Changer l'état du mode
    document.getElementById('draw-wall').classList.toggle('active', wallMode); // Changer le style du bouton
}

// Charger le plan de classe lorsque la page se charge
window.onload = loadClassroom;
