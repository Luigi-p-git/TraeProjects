import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { translationService } from '@/services/translationService'

interface FlashcardData {
  hint?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
  partOfSpeech?: string
  definition?: string
  examples?: string[]
}

interface ClickableTextProps {
  text: string
  onWordClick?: (french: string, spanish: string, data?: FlashcardData) => void
}

interface WordPopup {
  word: string
  translation: string
  position: { x: number; y: number }
  partOfSpeech?: string
  definition?: string
  examples?: string[]
}

interface HoverTooltip {
  word: string
  translation: string
  position: { x: number; y: number }
  isLoading: boolean
}

export function ClickableText({ text, onWordClick }: ClickableTextProps) {
  const [popup, setPopup] = useState<WordPopup | null>(null)
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null)
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set())
  const [isCreatingFlashcard, setIsCreatingFlashcard] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Safari detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)



  // Comprehensive translation mapping for French-Spanish
  // Expanded dictionary to make more words clickable
  const translations: Record<string, string> = {
    // Greetings and basic expressions
    'bonjour': 'hola',
    'salut': 'hola',
    'bonsoir': 'buenas noches',
    'nuit': 'noche',
    'merci': 'gracias',
    'au': 'al',
    'revoir': 'adiós',
    'oui': 'sí',
    'non': 'no',
    'si': 'si',
    'peut-être': 'quizás',
    'excusez': 'disculpe',
    'pardon': 'perdón',
    's\'il': 'por',
    'plaît': 'favor',
    'de': 'de',
    'rien': 'nada',
    
    // Question words
    'comment': 'cómo',
    'quoi': 'qué',
    'que': 'qué',
    'qui': 'quién',
    'quand': 'cuándo',
    'où': 'dónde',
    'pourquoi': 'por qué',
    'combien': 'cuánto',
    'quel': 'cuál',
    'quelle': 'cuál',
    
    // Pronouns
    'je': 'yo',
    'tu': 'tú',
    'il': 'él',
    'elle': 'ella',
    'nous': 'nosotros',
    'vous': 'usted/vosotros',
    'ils': 'ellos',
    'elles': 'ellas',
    'moi': 'yo/me',
    'toi': 'tú/te',
    'lui': 'él/le',
    'eux': 'ellos',
    'se': 'se',
    'me': 'me',
    'te': 'te',
    'le': 'lo/el',
    'la': 'la',
    'les': 'los/las',
    'un': 'un',
    'une': 'una',
    'des': 'unos/unas',
    'du': 'del',
    'ce': 'este',
    'cette': 'esta',
    'ces': 'estos/estas',
    'mon': 'mi',
    'ma': 'mi',
    'mes': 'mis',
    'ton': 'tu',
    'ta': 'tu',
    'tes': 'tus',
    'son': 'su',
    'sa': 'su',
    'ses': 'sus',
    'notre': 'nuestro',
    'nos': 'nuestros',
    'votre': 'vuestro',
    'vos': 'vuestros',
    'leur': 'su',
    'leurs': 'sus',
    
    // Common verbs
    'être': 'ser/estar',
    'suis': 'soy/estoy',
    'es': 'eres/estás',
    'est': 'es/está',
    'sommes': 'somos/estamos',
    'êtes': 'sois/estáis',
    'sont': 'son/están',
    'avoir': 'tener',
    'ai': 'tengo',
    'as': 'tienes',
    'a': 'tiene',
    'avons': 'tenemos',
    'avez': 'tenéis',
    'ont': 'tienen',
    'faire': 'hacer',
    'fais': 'hago',
    'fait': 'hace',
    'faisons': 'hacemos',
    'faites': 'hacéis',
    'font': 'hacen',
    'aller': 'ir',
    'vais': 'voy',
    'va': 'va',
    'allons': 'vamos',
    'allez': 'vais',
    'vont': 'van',
    'venir': 'venir',
    'viens': 'vengo',
    'vient': 'viene',
    'venons': 'venimos',
    'venez': 'venís',
    'viennent': 'vienen',
    'voir': 'ver',
    'vois': 'veo',
    'voit': 've',
    'voyons': 'vemos',
    'voyez': 'veis',
    'voient': 'ven',
    'savoir': 'saber',
    'sais': 'sé',
    'sait': 'sabe',
    'savons': 'sabemos',
    'savez': 'sabéis',
    'savent': 'saben',
    'pouvoir': 'poder',
    'peux': 'puedo',
    'peut': 'puede',
    'pouvons': 'podemos',
    'pouvez': 'podéis',
    'peuvent': 'pueden',
    'vouloir': 'querer',
    'veux': 'quiero',
    'veut': 'quiere',
    'voulons': 'queremos',
    'voulez': 'queréis',
    'veulent': 'quieren',
    'devoir': 'deber',
    'dois': 'debo',
    'doit': 'debe',
    'devons': 'debemos',
    'devez': 'debéis',
    'doivent': 'deben',
    'prendre': 'tomar',
    'prends': 'tomo',
    'prend': 'toma',
    'prenons': 'tomamos',
    'prenez': 'tomáis',
    'prennent': 'toman',
    'donner': 'dar',
    'donne': 'doy',
    'donnes': 'das',
    'donnons': 'damos',
    'donnez': 'dais',
    'donnent': 'dan',
    'mettre': 'poner',
    'mets': 'pongo',
    'met': 'pone',
    'mettons': 'ponemos',
    'mettez': 'ponéis',
    'mettent': 'ponen',
    'dire': 'decir',
    'dis': 'digo',
    'dit': 'dice',
    'disons': 'decimos',
    'dites': 'decís',
    'disent': 'dicen',
    'parler': 'hablar',
    'parle': 'hablo',
    'parles': 'hablas',
    'parlons': 'hablamos',
    'parlez': 'habláis',
    'parlent': 'hablan',
    'écouter': 'escuchar',
    'écoute': 'escucho',
    'écoutes': 'escuchas',
    'écoutons': 'escuchamos',
    'écoutez': 'escucháis',
    'écoutent': 'escuchan',
    'regarder': 'mirar',
    'regarde': 'miro',
    'regardes': 'miras',
    'regardons': 'miramos',
    'regardez': 'miráis',
    'regardent': 'miran',
    'manger': 'comer',
    'mange': 'como',
    'manges': 'comes',
    'mangeons': 'comemos',
    'mangez': 'coméis',
    'mangent': 'comen',
    'boire': 'beber',
    'bois': 'bebo',
    'boit': 'bebe',
    'buvons': 'bebemos',
    'buvez': 'bebéis',
    'boivent': 'beben',
    'dormir': 'dormir',
    'dors': 'duermo',
    'dort': 'duerme',
    'dormons': 'dormimos',
    'dormez': 'dormís',
    'dorment': 'duermen',
    'travailler': 'trabajar',
    'travaille': 'trabajo',
    'travailles': 'trabajas',
    'travaillons': 'trabajamos',
    'travaillez': 'trabajáis',
    'travaillent': 'trabajan',
    'étudier': 'estudiar',
    'étudie': 'estudio',
    'étudies': 'estudias',
    'étudions': 'estudiamos',
    'étudiez': 'estudiáis',
    'étudient': 'estudian',
    'apprendre': 'aprender',
    'apprends': 'aprendo',
    'apprend': 'aprende',
    'apprenons': 'aprendemos',
    'apprenez': 'aprendéis',
    'apprennent': 'aprenden',
    'comprendre': 'entender',
    'comprends': 'entiendo',
    'comprend': 'entiende',
    'comprenons': 'entendemos',
    'comprenez': 'entendéis',
    'comprennent': 'entienden',
    'aimer': 'amar/gustar',
    'aime': 'amo/me gusta',
    'aimes': 'amas/te gusta',
    'aimons': 'amamos/nos gusta',
    'aimez': 'amáis/os gusta',
    'aiment': 'aman/les gusta',
    'préférer': 'preferir',
    'préfère': 'prefiero',
    'préfères': 'prefieres',
    'préférons': 'preferimos',
    'préférez': 'preferís',
    'préfèrent': 'prefieren',
    'choisir': 'elegir',
    'choisis': 'elijo',
    'choisit': 'elige',
    'choisissons': 'elegimos',
    'choisissez': 'elegís',
    'choisissent': 'eligen',
    'acheter': 'comprar',
    'achète': 'compro',
    'achètes': 'compras',
    'achetons': 'compramos',
    'achetez': 'compráis',
    'achètent': 'compran',
    'vendre': 'vender',
    'vends': 'vendo',
    'vend': 'vende',
    'vendons': 'vendemos',
    'vendez': 'vendéis',
    'vendent': 'venden',
    'coûter': 'costar',
    'coûte': 'cuesta',
    'coûtent': 'cuestan',
    'payer': 'pagar',
    'paie': 'pago',
    'paies': 'pagas',
    'payons': 'pagamos',
    'payez': 'pagáis',
    'paient': 'pagan',
    
    // Common adjectives
    'bon': 'bueno',
    'bonne': 'buena',
    'bons': 'buenos',
    'bonnes': 'buenas',
    'mauvais': 'malo',
    'mauvaise': 'mala',
    'grand': 'grande',
    'grande': 'grande',
    'grands': 'grandes',
    'grandes': 'grandes',
    'petit': 'pequeño',
    'petite': 'pequeña',
    'petits': 'pequeños',
    'petites': 'pequeñas',
    'nouveau': 'nuevo',
    'nouvelle': 'nueva',
    'nouveaux': 'nuevos',
    'nouvelles': 'nuevas',
    'vieux': 'viejo',
    'vieille': 'vieja',
    'jeune': 'joven',
    'jeunes': 'jóvenes',
    'beau': 'hermoso',
    'belle': 'hermosa',
    'beaux': 'hermosos',
    'belles': 'hermosas',
    'joli': 'bonito',
    'jolie': 'bonita',
    'jolis': 'bonitos',
    'jolies': 'bonitas',
    'facile': 'fácil',
    'faciles': 'fáciles',
    'difficile': 'difícil',
    'difficiles': 'difíciles',
    'important': 'importante',
    'importante': 'importante',
    'importants': 'importantes',
    'importantes': 'importantes',
    'intéressant': 'interesante',
    'intéressante': 'interesante',
    'intéressants': 'interesantes',
    'intéressantes': 'interesantes',
    'content': 'contento',
    'contente': 'contenta',
    'contents': 'contentos',
    'contentes': 'contentas',
    'heureux': 'feliz',
    'heureuse': 'feliz',
    'triste': 'triste',
    'tristes': 'tristes',
    'fatigué': 'cansado',
    'fatiguée': 'cansada',
    'fatigués': 'cansados',
    'fatiguées': 'cansadas',
    'malade': 'enfermo',
    'malades': 'enfermos',
    'bien': 'bien',
    'mal': 'mal',
    'très': 'muy',
    'assez': 'bastante',
    'trop': 'demasiado',
    'plus': 'más',
    'moins': 'menos',
    'beaucoup': 'mucho',
    'peu': 'poco',
    'tout': 'todo',
    'toute': 'toda',
    'tous': 'todos',
    'toutes': 'todas',
    'autre': 'otro',
    'autres': 'otros',
    'même': 'mismo',
    'mêmes': 'mismos',
    
    // Places and locations
    'maison': 'casa',
    'appartement': 'apartamento',
    'chambre': 'habitación',
    'cuisine': 'cocina',
    'salle': 'sala',
    'bain': 'baño',
    'jardin': 'jardín',
    'école': 'escuela',
    'université': 'universidad',
    'travail': 'trabajo',
    'bureau': 'oficina',
    'magasin': 'tienda',
    'restaurant': 'restaurante',
    'café': 'café',
    'hôpital': 'hospital',
    'pharmacie': 'farmacia',
    'banque': 'banco',
    'poste': 'correos',
    'gare': 'estación',
    'aéroport': 'aeropuerto',
    'hôtel': 'hotel',
    'musée': 'museo',
    'théâtre': 'teatro',
    'cinéma': 'cine',
    'parc': 'parque',
    'plage': 'playa',
    'montagne': 'montaña',
    'mer': 'mar',
    'lac': 'lago',
    'rivière': 'río',
    'forêt': 'bosque',
    'ville': 'ciudad',
    'village': 'pueblo',
    'pays': 'país',
    'monde': 'mundo',
    'rue': 'calle',
    'avenue': 'avenida',
    'place': 'plaza',
    'pont': 'puente',
    'église': 'iglesia',
    
    // Transportation
    'voiture': 'coche',
    'train': 'tren',
    'avion': 'avión',
    'bus': 'autobús',
    'métro': 'metro',
    'vélo': 'bicicleta',
    'moto': 'moto',
    'bateau': 'barco',
    'taxi': 'taxi',
    'marcher': 'caminar',
    'courir': 'correr',
    'nager': 'nadar',
    'voler': 'volar',
    'conduire': 'conducir',
    
    // Activities and hobbies
    'jouer': 'jugar',
    'lire': 'leer',
    'écrire': 'escribir',
    'chanter': 'cantar',
    'danser': 'bailar',
    'dessiner': 'dibujar',
    'peindre': 'pintar',
    'cuisiner': 'cocinar',
    'nettoyer': 'limpiar',
    'ranger': 'ordenar',
    'réparer': 'reparar',
    'construire': 'construir',
    'créer': 'crear',
    'inventer': 'inventar',
    'découvrir': 'descubrir',
    'explorer': 'explorar',
    'voyager': 'viajar',
    'visiter': 'visitar',
    'rencontrer': 'conocer',
    'présenter': 'presentar',
    'expliquer': 'explicar',
    'enseigner': 'enseñar',
    'montrer': 'mostrar',
    'aider': 'ayudar',
    'servir': 'servir',
    'offrir': 'ofrecer',
    'recevoir': 'recibir',
    'envoyer': 'enviar',
    'appeler': 'llamar',
    'répondre': 'responder',
    'demander': 'preguntar',
    'chercher': 'buscar',
    'trouver': 'encontrar',
    'perdre': 'perder',
    'gagner': 'ganar',
    'réussir': 'tener éxito',
    'échouer': 'fracasar',
    'essayer': 'intentar',
    'commencer': 'empezar',
    'finir': 'terminar',
    'continuer': 'continuar',
    'arrêter': 'parar',
    'partir': 'salir',
    'arriver': 'llegar',
    'entrer': 'entrar',
    'sortir': 'salir',
    'monter': 'subir',
    'descendre': 'bajar',
    'tomber': 'caer',
    'lever': 'levantar',
    'asseoir': 'sentar',
    'coucher': 'acostar',
    'réveiller': 'despertar',
    'habiller': 'vestir',
    'laver': 'lavar',
    'brosser': 'cepillar',
    'peigner': 'peinar',
    'maquiller': 'maquillar',
    'raser': 'afeitar',
    
    // Objects and things
    'musique': 'música',
    'chanson': 'canción',
    'film': 'película',
    'livre': 'libro',
    'journal': 'periódico',
    'magazine': 'revista',
    'télévision': 'televisión',
    'radio': 'radio',
    'ordinateur': 'ordenador',
    'téléphone': 'teléfono',
    'portable': 'móvil',
    'internet': 'internet',
    'email': 'correo electrónico',
    'message': 'mensaje',
    'lettre': 'carta',
    'carte': 'tarjeta',
    'photo': 'foto',
    'image': 'imagen',
    'vidéo': 'vídeo',
    'jeu': 'juego',
    'sport': 'deporte',
    'football': 'fútbol',
    'tennis': 'tenis',
    'basketball': 'baloncesto',
    'natation': 'natación',
    'course': 'carrera',
    'ski': 'esquí',
    'danse': 'baile',
    'art': 'arte',
    'peinture': 'pintura',
    'sculpture': 'escultura',
    'dessin': 'dibujo',
    'instrument': 'instrumento',
    'piano': 'piano',
    'guitare': 'guitarra',
    'violon': 'violín',
    'batterie': 'batería',
    'flûte': 'flauta',
    'chant': 'canto',
    'voix': 'voz',
    'bruit': 'ruido',
    'silence': 'silencio',
    'lumière': 'luz',
    'couleur': 'color',
    'rouge': 'rojo',
    'bleu': 'azul',
    'vert': 'verde',
    'jaune': 'amarillo',
    'orange': 'naranja',
    'violet': 'violeta',
    'rose': 'rosa',
    'noir': 'negro',
    'blanc': 'blanco',
    'gris': 'gris',
    'marron': 'marrón',
    
    // Family and people
    'famille': 'familia',
    'parent': 'padre/madre',
    'parents': 'padres',
    'père': 'padre',
    'mère': 'madre',
    'fils': 'hijo',
    'fille': 'hija',
    'enfant': 'niño',
    'enfants': 'niños',
    'bébé': 'bebé',
    'frère': 'hermano',
    'sœur': 'hermana',
    'grand-père': 'abuelo',
    'grand-mère': 'abuela',
    'oncle': 'tío',
    'tante': 'tía',
    'cousin': 'primo',
    'cousine': 'prima',
    'neveu': 'sobrino',
    'nièce': 'sobrina',
    'mari': 'marido',
    'femme': 'mujer/esposa',
    'époux': 'esposo',
    'épouse': 'esposa',
    'copain': 'novio',
    'copine': 'novia',
    'ami': 'amigo',
    'amie': 'amiga',
    'amis': 'amigos',
    'voisin': 'vecino',
    'voisine': 'vecina',
    'collègue': 'colega',
    'patron': 'jefe',
    'chef': 'jefe',
    'employé': 'empleado',
    'client': 'cliente',
    'vendeur': 'vendedor',
    'vendeuse': 'vendedora',
    'caissier': 'cajero',
    'caissière': 'cajera',
    
    // Professions
    'professeur': 'profesor',
    'enseignant': 'profesor',
    'instituteur': 'maestro',
    'institutrice': 'maestra',
    'étudiant': 'estudiante',
    'élève': 'alumno',
    'médecin': 'médico',
    'docteur': 'doctor',
    'infirmier': 'enfermero',
    'infirmière': 'enfermera',
    'dentiste': 'dentista',
    'pharmacien': 'farmacéutico',
    'avocat': 'abogado',
    'juge': 'juez',
    'policier': 'policía',
    'pompier': 'bombero',
    'soldat': 'soldado',
    'ingénieur': 'ingeniero',
    'architecte': 'arquitecto',
    'informaticien': 'informático',
    'programmeur': 'programador',
    'designer': 'diseñador',
    'artiste': 'artista',
    'peintre': 'pintor',
    'sculpteur': 'escultor',
    'musicien': 'músico',
    'chanteur': 'cantante',
    'chanteuse': 'cantante',
    'acteur': 'actor',
    'actrice': 'actriz',
    'danseur': 'bailarín',
    'danseuse': 'bailarina',
    'écrivain': 'escritor',
    'journaliste': 'periodista',
    'photographe': 'fotógrafo',
    'cuisinier': 'cocinero',
    'cuisinière': 'cocinera',
    'serveur': 'camarero',
    'serveuse': 'camarera',
    'boulanger': 'panadero',
    'boulangère': 'panadera',
    'boucher': 'carnicero',
    'bouchère': 'carnicera',
    'coiffeur': 'peluquero',
    'coiffeuse': 'peluquera',
    'mécanicien': 'mecánico',
    'électricien': 'electricista',
    'plombier': 'fontanero',
    'jardinier': 'jardinero',
    'fermier': 'granjero',
    'agriculteur': 'agricultor',
    'chauffeur': 'conductor',
    'pilote': 'piloto',
    'marin': 'marinero',
    'facteur': 'cartero',
    'secrétaire': 'secretario',
    'comptable': 'contable',
    'banquier': 'banquero',
    'directeur': 'director',
    'manager': 'gerente',
    'président': 'presidente',
    'ministre': 'ministro',
    'maire': 'alcalde',
    
    // Time expressions
    'temps': 'tiempo',
    'heure': 'hora',
    'minute': 'minuto',
    'seconde': 'segundo',
    'moment': 'momento',
    'instant': 'instante',
    'période': 'período',
    'époque': 'época',
    'siècle': 'siglo',
    'année': 'año',
    'mois': 'mes',
    'semaine': 'semana',
    'jour': 'día',
    'journée': 'día',
    'date': 'fecha',
    'calendrier': 'calendario',
    'horaire': 'horario',
    'rendez-vous': 'cita',
    'matin': 'mañana',
    'matinée': 'mañana',
    'midi': 'mediodía',
    'après-midi': 'tarde',
    'soir': 'noche',
    'soirée': 'noche',
    'minuit': 'medianoche',
    'aube': 'amanecer',
    'aujourd\'hui': 'hoy',
    'hier': 'ayer',
    'demain': 'mañana',
    'avant-hier': 'anteayer',
    'après-demain': 'pasado mañana',
    'maintenant': 'ahora',
    'actuellement': 'actualmente',
    'bientôt': 'pronto',
    'tard': 'tarde',
    'tôt': 'temprano',
    'déjà': 'ya',
    'encore': 'todavía',
    'toujours': 'siempre',
    'jamais': 'nunca',
    'souvent': 'a menudo',
    'parfois': 'a veces',
    'quelquefois': 'a veces',
    'rarement': 'raramente',
    'longtemps': 'mucho tiempo',
    'rapidement': 'rápidamente',
    'lentement': 'lentamente',
    'vite': 'rápido',
    'doucement': 'despacio',
    
    // Weather and nature
    'météo': 'tiempo',
    'climat': 'clima',
    'saison': 'estación',
    'printemps': 'primavera',
    'été': 'verano',
    'automne': 'otoño',
    'hiver': 'invierno',
    'soleil': 'sol',
    'lune': 'luna',
    'étoile': 'estrella',
    'ciel': 'cielo',
    'nuage': 'nube',
    'pluie': 'lluvia',
    'neige': 'nieve',
    'vent': 'viento',
    'orage': 'tormenta',
    'tonnerre': 'trueno',
    'éclair': 'rayo',
    'brouillard': 'niebla',
    'gel': 'hielo',
    'chaud': 'caliente',
    'froid': 'frío',
    'tiède': 'tibio',
    'frais': 'fresco',
    'humide': 'húmedo',
    'sec': 'seco',
    'mouillé': 'mojado',
    'nature': 'naturaleza',
    'environnement': 'medio ambiente',
    'paysage': 'paisaje',
    'campagne': 'campo',
    'terre': 'tierra',
    'sol': 'suelo',
    'pierre': 'piedra',
    'rocher': 'roca',
    'sable': 'arena',
    'herbe': 'hierba',
    'fleur': 'flor',
    'arbre': 'árbol',
    'plante': 'planta',
    'feuille': 'hoja',
    'branche': 'rama',
    'racine': 'raíz',
    'fruit': 'fruta',
    'légume': 'verdura',
    'animal': 'animal',
    'chien': 'perro',
    'chat': 'gato',
    'oiseau': 'pájaro',
    'poisson': 'pez',
    'cheval': 'caballo',
    'vache': 'vaca',
    'mouton': 'oveja',
    'cochon': 'cerdo',
    'poule': 'gallina',
    'coq': 'gallo',
    'canard': 'pato',
    'lapin': 'conejo',
    'souris': 'ratón',
    'insecte': 'insecto',
    'papillon': 'mariposa',
    'abeille': 'abeja',
    'mouche': 'mosca',
    'araignée': 'araña'
  }

  const handleWordClick = async (event: React.MouseEvent, word: string) => {
    // Clean the word (remove punctuation)
    const cleanWord = word.toLowerCase().replace(/[.,!?;:"'()\[\]]/g, '')
    
    // Hide hover tooltip when clicking
    setHoverTooltip(null)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // First try static dictionary for instant response
    let translation = translations[cleanWord]
    
    if (translation) {
      const target = event.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()
      
      // Safari-compatible positioning
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft
      const scrollY = window.pageYOffset || document.documentElement.scrollTop
      
      const getPopupPosition = () => {
        if (isSafari && containerRect) {
          return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: Math.max(rect.top - containerRect.top - 10, 50)
          }
        } else {
          return {
            x: rect.left + scrollX + rect.width / 2,
            y: Math.max(rect.top + scrollY - 10, 50)
          }
        }
      }
      
      setPopup({
        word: cleanWord,
        translation,
        position: getPopupPosition()
      })
    } else if (translationService.isConfigured()) {
      // If not in static dictionary, try dynamic translation
      try {
        const target = event.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()
        
        // Safari-compatible positioning
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft
        const scrollY = window.pageYOffset || document.documentElement.scrollTop
        
        const getPopupPosition = () => {
          if (isSafari && containerRect) {
            return {
              x: rect.left - containerRect.left + rect.width / 2,
              y: Math.max(rect.top - containerRect.top - 10, 50)
            }
          } else {
            return {
              x: rect.left + scrollX + rect.width / 2,
              y: Math.max(rect.top + scrollY - 10, 50)
            }
          }
        }
        
        const translationResponse = await translationService.translateWord(cleanWord)
        
        setPopup({
          word: cleanWord,
          translation: translationResponse.translation,
          partOfSpeech: translationResponse.partOfSpeech,
          definition: translationResponse.definition,
          examples: translationResponse.examples,
          position: getPopupPosition()
        })
      } catch (error) {
        console.error('Translation error:', error)
      }
    }
  }

  const handleWordHover = async (event: React.MouseEvent | React.TouchEvent, word: string) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    const cleanWord = word.toLowerCase().replace(/[.,!?;:"'()\[\]]/g, '')
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    
    // Safari-compatible positioning
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    // Different positioning strategy for Safari
    const getPosition = () => {
      if (isSafari && containerRect) {
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 60
        }
      } else {
        return {
          x: rect.left + scrollX + rect.width / 2,
          y: rect.top + scrollY - 60
        }
      }
    }
    
    // Check static dictionary first
    const staticTranslation = translations[cleanWord]
    
    if (staticTranslation) {
      setHoverTooltip({
        word: cleanWord,
        translation: staticTranslation,
        position: getPosition(),
        isLoading: false
      })
    } else if (translationService.isConfigured()) {
      // Show loading tooltip
      setHoverTooltip({
        word: cleanWord,
        translation: 'Cargando...',
        position: getPosition(),
        isLoading: true
      })
      
      // Set timeout for translation request
      hoverTimeoutRef.current = setTimeout(async () => {
        try {
          const translationResponse = await translationService.translateWord(cleanWord)
          
          setHoverTooltip(prev => {
            if (prev && prev.word === cleanWord) {
              return {
                ...prev,
                translation: translationResponse.translation,
                isLoading: false
              }
            }
            return prev
          })
        } catch (error) {
          console.error('Hover translation error:', error)
          setHoverTooltip(prev => {
            if (prev && prev.word === cleanWord) {
              return {
                ...prev,
                translation: 'Error de traducción',
                isLoading: false
              }
            }
            return prev
          })
        }
      }, 500) // 500ms delay before fetching translation
    }
  }
  
  const handleWordLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoverTooltip(null)
  }

  const handleAddToFlashcards = async () => {
    if (!popup) return
    
    setIsCreatingFlashcard(true)
    
    try {
      if (translationService.isConfigured()) {
        // Create dynamic flashcard using Gemini
        const flashcard = await translationService.createFlashcard(popup.word)
        
        // Call the parent callback with enhanced flashcard data
        if (onWordClick) {
          onWordClick(flashcard.front, flashcard.back, {
            hint: flashcard.hint,
            difficulty: flashcard.difficulty,
            category: flashcard.category,
            partOfSpeech: popup.partOfSpeech,
            definition: popup.definition,
            examples: popup.examples
          })
        }
      } else {
        // Fallback to simple flashcard
        if (onWordClick) {
          onWordClick(popup.word, popup.translation)
        }
      }
      
      setAddedWords(prev => new Set([...prev, popup.word]))
      setPopup(null)
    } catch (error) {
      console.error('Error creating flashcard:', error)
      // Fallback to simple flashcard on error
      if (onWordClick) {
        onWordClick(popup.word, popup.translation)
      }
      setAddedWords(prev => new Set([...prev, popup.word]))
      setPopup(null)
    } finally {
      setIsCreatingFlashcard(false)
    }
  }

  const closePopup = () => {
    setPopup(null)
  }

  const renderClickableText = (text: string) => {
    // Split text into words while preserving spaces and punctuation
    const words = text.split(/(\s+|[.,!?;:"'()\[\]])/)
    
    return words.map((segment, index) => {
      // If it's whitespace or punctuation, render as-is
      if (/^(\s+|[.,!?;:"'()\[\]])$/.test(segment)) {
        return <span key={index}>{segment}</span>
      }
      
      // If it's a word, make it clickable if it has a translation
      const cleanWord = segment.toLowerCase().replace(/[.,!?;:"'()\[\]]/g, '')
      const hasTranslation = translations[cleanWord]
      
      if (hasTranslation || translationService.isConfigured()) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              handleWordClick(e, segment)
            }}
            onMouseEnter={(e) => {
              e.preventDefault()
              handleWordHover(e, segment)
            }}
            onMouseLeave={(e) => {
              e.preventDefault()
              handleWordLeave()
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              handleWordHover(e, segment)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              setTimeout(() => handleWordLeave(), 2000) // Keep tooltip visible for 2s on touch
            }}
            className="cursor-pointer hover:bg-blue-500/20 hover:text-blue-300 rounded px-1 transition-all duration-200 relative select-none"
            style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
            title={hasTranslation ? `Haz clic para añadir "${cleanWord}" a las tarjetas` : `Pasa el cursor para traducir "${cleanWord}"`}
          >
            {segment}
            {addedWords.has(cleanWord) && (
              <Check className="inline w-3 h-3 ml-1 text-green-400" />
            )}
          </span>
        )
      }
      
      return <span key={index}>{segment}</span>
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="relative overflow-visible" 
      ref={containerRef}
      style={{ 
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        position: 'relative'
      }}
    >
      <div className="text-white leading-relaxed">
        {renderClickableText(text)}
      </div>
      
      <AnimatePresence>
        {/* Hover Tooltip */}
        {hoverTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={isSafari ? "absolute z-40 pointer-events-none" : "fixed z-40 pointer-events-none"}
            style={{
              left: isSafari 
                ? Math.max(10, Math.min(hoverTooltip.position.x, (containerRef.current?.getBoundingClientRect().width || window.innerWidth) - 200))
                : Math.max(100, Math.min(hoverTooltip.position.x, window.innerWidth - 200)),
              top: isSafari 
                ? Math.max(10, hoverTooltip.position.y)
                : Math.max(10, hoverTooltip.position.y),
              transform: 'translate(-50%, 0)',
              WebkitTransform: 'translate(-50%, 0)', // Safari fallback
              zIndex: 9999 // Ensure it's on top
            }}

          >
            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-900/90 to-purple-900/90 border-blue-400/30 shadow-2xl">
              <CardContent className="p-3 text-center space-y-1">
                <div className="text-xs font-medium text-blue-200">
                  {hoverTooltip.word}
                </div>
                <div className="text-sm text-white flex items-center justify-center font-medium">
                  {hoverTooltip.isLoading && (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  )}
                  {hoverTooltip.translation}
                </div>
                {!hoverTooltip.isLoading && (
                  <div className="text-xs text-blue-300/80 mt-1">
                    💡 Haz clic para añadir a tarjetas
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Click Popup */}
        {popup && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={closePopup}
            />
            
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={isSafari ? "absolute z-50" : "fixed z-50"}
              style={{
                left: isSafari 
                  ? Math.max(10, Math.min(popup.position.x, (containerRef.current?.getBoundingClientRect().width || window.innerWidth) - 300))
                  : popup.position.x,
                top: isSafari 
                  ? Math.max(10, popup.position.y)
                  : popup.position.y,
                transform: 'translate(-50%, -100%)',
                WebkitTransform: 'translate(-50%, -100%)', // Safari fallback
                zIndex: 9999
              }}
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl max-w-sm">
                <CardContent className="p-4 text-center space-y-3">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {popup.word}
                      {popup.partOfSpeech && (
                        <span className="text-xs text-white/60 ml-2">({popup.partOfSpeech})</span>
                      )}
                    </div>
                    <div className="text-sm text-blue-300">
                      {popup.translation}
                    </div>
                    {popup.definition && (
                      <div className="text-xs text-white/70 mt-1">
                        {popup.definition}
                      </div>
                    )}
                    {popup.examples && popup.examples.length > 0 && (
                      <div className="text-xs text-white/60 mt-2 space-y-1">
                        <div className="font-medium">Ejemplos:</div>
                        {popup.examples.slice(0, 2).map((example, idx) => (
                          <div key={idx} className="italic">{example}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddToFlashcards}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                      disabled={addedWords.has(popup.word) || isCreatingFlashcard}
                    >
                      {isCreatingFlashcard ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Creando...
                        </>
                      ) : addedWords.has(popup.word) ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Añadido
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Añadir
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={closePopup}
                      size="sm"
                      variant="outline"
                      className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/20 text-white"
                    >
                      Cerrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}