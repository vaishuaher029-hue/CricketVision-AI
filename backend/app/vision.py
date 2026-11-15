
import logging
import re
import unicodedata
from pathlib import Path

logger = logging.getLogger(__name__)

ROSTER = [
    {"name": "Rohit Sharma", "jersey": "45", "role": "Batter"},
    {"name": "Virat Kohli", "jersey": "18", "role": "Batter"},
    {"name": "Hardik Pandya", "jersey": "33", "role": "All-rounder"},
    {"name": "Jasprit Bumrah", "jersey": "93", "role": "Bowler"},
    {"name": "Ravindra Jadeja", "jersey": "8", "role": "All-rounder"},
]


def _normalize(value: str) -> str:
    plain = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", plain.casefold()).split())


def detect_faces(image):
    """Detect face locations only; never identify people."""
    import cv2

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    cascade_path = (
        Path(cv2.data.haarcascades)
        / "haarcascade_frontalface_default.xml"
    )
    detector = cv2.CascadeClassifier(str(cascade_path))

    if detector.empty():
        logger.error("OpenCV face detection cascade could not be loaded")
        return image.copy(), 0

    height, width = gray.shape
    scale = min(1.0, 1200 / max(width, height))

    if scale < 1.0:
        small = cv2.resize(gray, None, fx=scale, fy=scale)
    else:
        small = gray

    faces = detector.detectMultiScale(
        small,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(35, 35),
    )

    annotated = image.copy()

    for x, y, w, h in faces:
        x = int(x / scale)
        y = int(y / scale)
        w = int(w / scale)
        h = int(h / scale)

        cv2.rectangle(
            annotated,
            (x, y),
            (x + w, y + h),
            (0, 220, 255),
            3,
        )

        cv2.putText(
            annotated,
            "Face detected",
            (x, max(25, y - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (0, 220, 255),
            2,
        )

    return annotated, len(faces)


def extract_clues(image_path: str) -> tuple[str | None, str | None, str]:
    """Extract visible jersey-number and printed-name clues only."""
    try:
        import cv2
        import pytesseract

        image = cv2.imread(image_path)
        if image is None:
            return None, None, "Image could not be decoded. No player match was made."

        height, width = image.shape[:2]
        if width * height > 20_000_000:
            return None, None, "Image exceeds the 20-megapixel processing limit."

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        if max(width, height) < 1600:
            gray = cv2.resize(
                gray, None, fx=1.5, fy=1.5,
                interpolation=cv2.INTER_CUBIC
            )

        text = pytesseract.image_to_string(gray, config="--psm 11")

        numbers = re.findall(r"(?<!\d)(\d{1,3})(?!\d)", text)
        number = numbers[0] if numbers else None

        name_lines = [
            " ".join(re.sub(r"[^A-Za-z ]", " ", line).split())
            for line in text.splitlines()
        ]

        name = next(
            (
                line.title()
                for line in name_lines
                if 4 <= len(line) <= 28 and len(line.split()) <= 3
            ),
            None,
        )

        if number or name:
            return number, name, (
                "Visible text was extracted with OCR. "
                "Verify the clue manually."
            )

        return None, None, (
            "No readable jersey number or printed name was detected. "
            "Result is uncertain."
        )

    except ImportError:
        logger.exception("OCR dependencies are unavailable")
        return None, None, "OCR dependencies are unavailable."

    except Exception as exc:
        try:
            import pytesseract
            if isinstance(exc, pytesseract.TesseractNotFoundError):
                return None, None, (
                    "Tesseract OCR is not installed. No player match was made."
                )
        except ImportError:
            pass

        logger.exception("Visible-text OCR failed")
        return None, None, "OCR could not read this image. No player match was made."


def match_roster(number: str | None, name: str | None) -> tuple[str | None, int]:
    """Match only exact visible text clues against the demo roster."""
    number_match = next(
        (p for p in ROSTER if number == p["jersey"]), None
    )

    normalized_name = _normalize(name) if name else ""

    name_match = next(
        (p for p in ROSTER if normalized_name == _normalize(p["name"])),
        None,
    )

    if number_match and name_match:
        if number_match["name"] != name_match["name"]:
            return None, 0
        return number_match["name"], 97

    if name_match:
        return name_match["name"], 90

    if number_match:
        return number_match["name"], 78

    return None, 0
