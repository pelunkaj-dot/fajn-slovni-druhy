"""Testy nástrojů korpusu. Spuštění: python -m unittest discover tests"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
import korpus  # noqa: E402
from kontrola import zkontroluj  # noqa: E402
from mapovani import ciste_lemma, skolni_druh  # noqa: E402


class TestFormat(unittest.TestCase):
    def test_zakladni_veta(self):
        s = korpus.rozloz_radek('Malý/2 pes/1 štěká/5 .', 1)
        self.assertEqual([(x.t, x.d) for x in s], [('Malý', 2), ('pes', 1), ('štěká', 5)])
        self.assertEqual(s[-1].i, '.')

    def test_znacky(self):
        s = korpus.rozloz_radek('Včera/6 jsem/5+ to/3 psal/5+ , ráno/6*{Kdy? – ráno.} jeho/3:privlastnovaci dva/4+2 !', 1)
        self.assertEqual(s[1].g, 1)
        self.assertEqual(s[3].g, 1)
        self.assertEqual(s[3].i, ',')
        self.assertTrue(s[4].v)
        self.assertEqual(s[4].n, 'Kdy? – ráno.')
        self.assertEqual(s[5].p, 'privlastnovaci')
        self.assertEqual(s[6].g, 2)
        self.assertEqual(s[6].i, '!')

    def test_chyby(self):
        for spatne in ('pes štěká', 'pes/11', '. Pes/1', ''):
            with self.assertRaises(korpus.ChybaKorpusu):
                korpus.rozloz_radek(spatne, 1)

    def test_soubor_a_cisla(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / 'svet1.txt'
            p.write_text('# komentář\n0007| Pes/1 štěká/5 .\n@jevy: kontext\nKočka/1 spí/5 .  # pozn\n', encoding='utf-8')
            self.assertEqual(korpus.dopln_cisla(p), 1)
            vety, chyby = korpus.nacti(p)
            self.assertEqual(chyby, [])
            self.assertEqual([v.cislo for v in vety], ['0007', '0008'])
            self.assertEqual(vety[1].jevy, ['kontext'])
            self.assertEqual(korpus.dopln_cisla(p), 0)


class TestMapovani(unittest.TestCase):
    def test_druhy(self):
        pripady = [
            ('NNMS1-----A----', 'pes', 1), ('AAIS1----1A----', 'malý', 2),
            ('P7-X4----------', 'se_^(zvr._zájmeno/částice)', 3),
            ('RV--7----------', 'se-1', 7), ('Vc-P---1-------', 'být', 5),
            ('J,-------------', 'aby', 8), ('Db-------------', 'kde', 6),
            ('TT-------------', 'prý', 9), ('II-------------', 'haf', 10),
            ('NNIS1-----A----', 'milion', 4), ('ACYS------A----', 'rád', 2),
        ]
        for znacka, lemma, druh in pripady:
            self.assertEqual(skolni_druh(znacka, lemma)[0], druh, (znacka, lemma))

    def test_neurceno(self):
        self.assertIsNone(skolni_druh('X@-------------', 'xyz')[0])
        self.assertIsNone(skolni_druh('Z:-------------', '.')[0])

    def test_lemma(self):
        self.assertEqual(ciste_lemma('štěkat_:T'), 'štěkat')
        self.assertEqual(ciste_lemma('na-1'), 'na')
        self.assertEqual(ciste_lemma('Matýsek_;Y'), 'Matýsek')


class FalesnyAnalyzator:
    def __init__(self, odpovedi):
        self.odpovedi = odpovedi

    def analyzuj(self, vety):
        return [[self.odpovedi[t] for t in v] for v in vety]


class TestKontrola(unittest.TestCase):
    def test_neshody_a_lemmata(self):
        vety = [korpus.Veta('0001', 1, korpus.rozloz_radek('Jiný/2 pes/1 rychle/2 , běží/5 .', 1))]
        analyzator = FalesnyAnalyzator({
            'Jiný': ('jiný', 'AAMS1----1A----'), 'pes': ('pes', 'NNMS1-----A----'),
            'rychle': ('rychle', 'Dg-------1A----'), ',': (',', 'Z:-------------'),
            'běží': ('běžet', 'VB-S---3P-AA---'), '.': ('.', 'Z:-------------'),
        })
        neshody, lemmata = zkontroluj(1, vety, analyzator)
        self.assertEqual([n['slovo'] for n in neshody], ['Jiný', 'rychle'])
        self.assertIn('bod 26', neshody[0]['poznamka'])
        self.assertEqual(neshody[1]['analyzator'], '6 příslovce')
        self.assertEqual(lemmata[3], ('s1-0001', 3, 'běží', 'běžet'))


if __name__ == '__main__':
    unittest.main()
