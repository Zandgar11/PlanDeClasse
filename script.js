let wallMode = false; // Indicateur pour le mode de dessin de murs
let students = []; // Liste des élèves
let classroomGrid = document.getElementById('classroom-grid'); // Référence à la grille
let highlightedCell = null; // Référence à la cellule mise en surbrillance

// Fonction pour créer la grille
function createGrid() {
    const gridSizeX = document.getElementById('cols').value; // Colonnes
    const gridSizeY = document.getElementById('rows').value; // Lignes
    classroomGrid.innerHTML = ''; // Réinitialiser la grille

    // Créer les cellules
    for (let i = 0; i < gridSizeY * gridSizeX; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.position = i; // Attribuer un identifiant de position

        // Événements pour le clic sur la cellule
        cell.addEventListener('click', () => {
            if (wallMode) {
                placeElement(cell, 'mur'); // Placer un mur
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

        classroomGrid.appendChild(cell); // Ajouter la cellule à la grille
    }

    classroomGrid.style.gridTemplateColumns = `repeat(${gridSizeX}, 40px)`; // Mise à jour des colonnes
    classroomGrid.style.gridTemplateRows = `repeat(${gridSizeY}, 40px)`; // Mise à jour des lignes
}

// Placer un élément dans la cellule sélectionnée
function placeElement(cell, elementType) {
    cell.classList.remove('eleve', 'mur', 'bureau'); // Supprimer toutes les classes existantes
    cell.innerText = ''; // Réinitialiser le contenu textuel

    // Ajouter la classe correspondant au type d'élément
    if (elementType === 'mur') {
        cell.classList.add('mur');
        cell.innerText = 'Mur'; // Placer le texte du mur
    } else if (elementType === 'bureau') {
        cell.classList.add('bureau');
        cell.innerText = 'Bureau'; // Placer le texte du bureau
    } else {
        cell.classList.add('eleve');
        cell.innerText = elementType; // Placer le nom de l'élève
        addStudentToSidebar(elementType); // Ajouter à la sidebar des élèves
    }
}

// Ajouter un élève à la sidebar
function addStudentToSidebar(studentName) {
    if (!students.includes(studentName)) {
        students.push(studentName); // Ajoute l'élève à la liste
        const studentList = document.getElementById('studentList');
        const studentItem = document.createElement('li');
        studentItem.innerText = studentName;
        studentItem.dataset.name = studentName; // Ajouter un attribut pour le nom de l'élève
        studentItem.addEventListener('click', () => {
            modifyStudentName(studentItem, studentName); // Modifier le nom de l'élève
        });
        studentItem.addEventListener('mouseenter', () => highlightCell(studentName)); // Survoler le nom
        studentItem.addEventListener('mouseleave', () => resetCellHighlight()); // Quitter le survol
        studentList.appendChild(studentItem); // Ajouter l'élève à la liste des élèves sur le plan
    }
}

// Modifier le nom de l'élève
function modifyStudentName(studentItem, oldName) {
    const newName = prompt('Modifier le nom de l\'élève:', oldName);
    if (newName && newName !== oldName) {
        // Mettre à jour le nom dans la liste
        studentItem.innerText = newName;

        // Mettre à jour le nom dans la grille
        const cell = [...classroomGrid.children].find(cell => cell.innerText === oldName);
        if (cell) {
            cell.innerText = newName; // Mettre à jour le nom dans la cellule

            // Supprimer les anciens événements de survol (basés sur l'ancien nom)
            cell.removeEventListener('mouseenter', () => highlightCell(oldName));
            cell.removeEventListener('mouseleave', resetCellHighlight);

            // Ajouter de nouveaux événements de survol (basés sur le nouveau nom)
            cell.addEventListener('mouseenter', () => highlightCell(newName));
            cell.addEventListener('mouseleave', resetCellHighlight);
        }

        // Mettre à jour le tableau des élèves
        const index = students.indexOf(oldName);
        if (index > -1) {
            students[index] = newName; // Remplacer le nom dans la liste
        }

        // Mettre à jour également les événements de survol dans la liste des élèves
        studentItem.removeEventListener('mouseenter', () => highlightCell(oldName));
        studentItem.removeEventListener('mouseleave', resetCellHighlight);

        // Ajouter les nouveaux événements de survol basés sur le nouveau nom
        studentItem.addEventListener('mouseenter', () => highlightCell(newName));
        studentItem.addEventListener('mouseleave', resetCellHighlight);
    }
}

// Changer le mode pour dessiner des murs
function toggleWallMode() {
    wallMode = !wallMode;
    document.getElementById('draw-wall').innerText = wallMode ? 'Mode Mur: Activé' : 'Mode Mur: Désactivé';
}

// Fonction pour réinitialiser la grille
function clearGrid() {
    classroomGrid.innerHTML = '';
    students = []; // Réinitialiser la liste des élèves
    document.getElementById('studentList').innerHTML = ''; // Réinitialiser la sidebar
}

// Fonction pour gérer le glisser-déposer
function drag(event) {
    event.dataTransfer.setData('text/plain', event.target.id); // Enregistrer l'identifiant de l'élément
}

// Survoler la cellule correspondante
function highlightCell(studentName) {
    resetCellHighlight(); // Réinitialiser la surbrillance précédente
    highlightedCell = [...classroomGrid.children].find(cell => cell.innerText === studentName);
    if (highlightedCell) {
        highlightedCell.style.backgroundColor = 'yellow'; // Changer la couleur de la cellule
    }
}

// Réinitialiser la surbrillance de la cellule
function resetCellHighlight() {
    if (highlightedCell) {
        highlightedCell.style.backgroundColor = ''; // Réinitialiser la couleur de la cellule
        highlightedCell = null; // Réinitialiser la référence
    }
}

// Ajouter des événements pour les boutons "Annuler" et "Rétablir"
let history = []; // Historique des états
let currentState = -1;

function undo() {
    if (currentState > 0) {
        currentState--;
        restoreState(history[currentState]);
    }
}

function redo() {
    if (currentState < history.length - 1) {
        currentState++;
        restoreState(history[currentState]);
    }
}

function saveClassroom() {
    const state = [];
    Array.from(classroomGrid.children).forEach(cell => {
        state.push({
            position: cell.dataset.position,
            classList: Array.from(cell.classList),
            text: cell.innerText
        });
    });
    history = history.slice(0, currentState + 1);
    history.push(state);
    currentState++;
}

function restoreState(state) {
    classroomGrid.innerHTML = ''; // Réinitialiser la grille
    state.forEach(cellData => {
        const cell = document.createElement('div');
        cell.classList.add('cell', ...cellData.classList);
        cell.innerText = cellData.text;
        cell.dataset.position = cellData.position;
        classroomGrid.appendChild(cell);
    });
}

// Exporter et importer la configuration
function exportConfiguration() {
    const state = Array.from(classroomGrid.children).map(cell => ({
        position: cell.dataset.position,
        class: Array.from(cell.classList),
        text: cell.innerText
    }));
    const json = JSON.stringify(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'configuration.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const state = JSON.parse(event.target.result);
            clearGrid(); // Réinitialiser la grille avant d'importer
            state.forEach(cellData => {
                const cell = document.createElement('div');
                cell.classList.add('cell', ...cellData.class);
                cell.innerText = cellData.text;
                cell.dataset.position = cellData.position;
                classroomGrid.appendChild(cell);
            });
        };
        reader.readAsText(file);
    };
    input.click();
}

// Initialiser la grille lors du chargement de la page
window.onload = createGrid; // Initialisation de la grille
