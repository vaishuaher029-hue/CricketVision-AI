import pytesseract
from PIL import Image

from app.vision import extract_clues, match_roster


def test_matching_requires_an_exact_roster_clue():
    assert match_roster("18", None) == ("Virat Kohli", 78)
    assert match_roster(None, "Virat Kohli") == ("Virat Kohli", 90)
    assert match_roster("18", "Virat Kohli") == ("Virat Kohli", 97)


def test_conflicting_or_weak_clues_stay_uncertain():
    assert match_roster("18", "Rohit Sharma") == (None, 0)
    assert match_roster(None, "Kohli") == (None, 0)
    assert match_roster("71", "Unknown Player") == (None, 0)


def test_ocr_text_is_extracted_and_can_be_matched(tmp_path, monkeypatch):
    image_path = tmp_path / "jersey.png"
    Image.new("RGB", (240, 240), "white").save(image_path)
    monkeypatch.setattr(
        pytesseract,
        "image_to_string",
        lambda image, config: "Virat Kohli\n18",
    )

    number, name, explanation = extract_clues(str(image_path))

    assert number == "18"
    assert name == "Virat Kohli"
    assert "OCR" in explanation
    assert match_roster(number, name) == ("Virat Kohli", 97)
