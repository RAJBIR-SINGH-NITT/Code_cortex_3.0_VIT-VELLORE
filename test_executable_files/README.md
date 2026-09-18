# Machine Learning Malware Triage: Test File Generation Guide

This document outlines the methodology used to generate the three test executable files present in this repository. Because our machine learning model evaluates the structural architecture of Portable Executable files rather than traditional text-based signatures, we engineered safe, non-destructive files that mathematically mimic advanced malware evasion techniques.

## 1. The Baseline File (Benign)

* **File Name:** `notepad(normal).exe`
* **Size:** 352 KB
* **Method:** Copied directly from a standard Windows `System32` environment.
* **Purpose:** This file serves as our control test. It contains a standard Portable Executable header, normal code boundaries, an exposed list of standard Windows API imports, and an average section entropy. Our model analyzes these standard features and confidently routes the file to the **BENIGN** category.

## 2. The Packed Anomaly (Malware Simulation)

* **File Name:** `malware.exe`
* **Tool Used:** Ultimate Packer for eXecutables (UPX) via PowerShell
* **Command Executed:** `.\upx.exe "-9" --force notepad.exe "-o" malware.exe`
* **Methodology & Purpose:** Malware authors frequently use packers to compress their code, hiding their true imports and evading signature-based antivirus scanners. We packed the baseline notepad file using maximum compression. The force flag was utilized to intentionally strip Control Flow Guard security protections from the header.
* **Model Reaction:** The packing process causes the maximum section entropy to spike toward the mathematical ceiling. It also creates a massive discrepancy between the physical file size on the disk and the virtual memory space it requests to unpack itself. The classifier recognizes these specific mathematical traits and correctly flags the file as **MALWARE**.

## 3. The Structural Bloat (Needs Analysis Simulation)

* **File Name:** `Unusual.exe`
* **Tool Used:** CFF Explorer
* **Methodology & Purpose:** To test the boundaries of our Isolation Forest novelty detector, we needed a file that was structurally bizarre but lacked explicitly malicious indicators. We opened the Section Headers of a benign executable and manually injected 10 empty sections, each sized at `1000` hexadecimal, representing 4096 bytes of blank space.
* **Model Reaction:** The classifier sees a relatively harmless application because the imports are intact and the entry point is valid. However, the Isolation Forest calculates that the section count is unnaturally high, while the average entropy has plummeted due to the injected blank space. It recognizes the architecture as a severe outlier compared to the training data. Instead of forcing a false positive, the triage system safely routes this file to the **NEEDS_ANALYSIS** queue for human review.
