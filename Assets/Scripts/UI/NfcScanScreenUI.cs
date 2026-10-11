#if UNITY_5_3_OR_NEWER || UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using MonsterLink.NFC;
using MonsterLink.Persistence;

namespace MonsterLink.UI
{
    /// <summary>
    /// Unity MonoBehaviour adapter for the NFC Scan screen.
    /// Hooks UI buttons, text inputs, and feedback banners to the NfcScanPresenter.
    /// </summary>
    public class NfcScanScreenUI : MonoBehaviour, INfcScanView
    {
        [Header("Status Feedback")]
        [SerializeField] private Text statusBannerText;
        [SerializeField] private Image statusBannerBg;

        [Header("Predefined Test Card Buttons")]
        [SerializeField] private Button card1Button; // ML-CARD-IGNI-01
        [SerializeField] private Button card2Button; // ML-CARD-AQUA-02
        [SerializeField] private Button card3Button; // ML-CARD-FLOR-03
        [SerializeField] private Button card4Button; // ML-CARD-VOLT-04

        [Header("Custom / Negative Testing Input")]
        [SerializeField] private InputField customCodeInputField;
        [SerializeField] private Button scanCustomButton;

        [Header("Scan Attempt History")]
        [SerializeField] private Transform historyContentParent;
        [SerializeField] private GameObject historyItemPrefab;

        private NfcScanPresenter _presenter;

        public event Action<string> OnScanRequested;

        private void Awake()
        {
            if (card1Button != null) card1Button.onClick.AddListener(() => RequestScan("ML-CARD-IGNI-01"));
            if (card2Button != null) card2Button.onClick.AddListener(() => RequestScan("ML-CARD-AQUA-02"));
            if (card3Button != null) card3Button.onClick.AddListener(() => RequestScan("ML-CARD-FLOR-03"));
            if (card4Button != null) card4Button.onClick.AddListener(() => RequestScan("ML-CARD-VOLT-04"));

            if (scanCustomButton != null && customCodeInputField != null)
            {
                scanCustomButton.onClick.AddListener(() =>
                {
                    string code = customCodeInputField.text;
                    if (!string.IsNullOrEmpty(code))
                    {
                        RequestScan(code);
                    }
                });
            }
        }

        public void Initialize(INfcReader reader, NfcRegistrationService registrationService)
        {
            _presenter = new NfcScanPresenter(this, reader, registrationService);
            _presenter.Initialize();
        }

        private void OnDestroy()
        {
            if (_presenter != null)
            {
                _presenter.Teardown();
            }
        }

        private void RequestScan(string cardCode)
        {
            if (OnScanRequested != null)
            {
                OnScanRequested.Invoke(cardCode);
            }
        }

        public void DisplayPredefinedCards(IEnumerable<string> cardCodes)
        {
            // Cards are configured in Inspector or dynamically rendered
        }

        public void ShowScanResult(RegistrationResult result)
        {
            if (statusBannerText != null)
            {
                statusBannerText.text = result.Message;
            }

            if (statusBannerBg != null)
            {
                if (result.IsSuccess)
                {
                    statusBannerBg.color = new Color(0.18f, 0.65f, 0.35f); // Green
                }
                else if (result.Status == RegistrationStatus.Duplicate)
                {
                    statusBannerBg.color = new Color(0.85f, 0.65f, 0.15f); // Yellow / Warn
                }
                else
                {
                    statusBannerBg.color = new Color(0.85f, 0.25f, 0.25f); // Red / Error
                }
            }
        }

        public void UpdateScanHistory(IReadOnlyList<ScanAttemptRecord> history)
        {
            if (historyContentParent == null || historyItemPrefab == null) return;

            // Clear existing
            foreach (Transform child in historyContentParent)
            {
                Destroy(child.gameObject);
            }

            // Render up to 10 most recent entries
            int count = Math.Min(10, history.Count);
            for (int i = 0; i < count; i++)
            {
                GameObject itemObj = Instantiate(historyItemPrefab, historyContentParent);
                Text label = itemObj.GetComponentInChildren<Text>();
                if (label != null)
                {
                    label.text = history[i].ToString();
                }
            }
        }
    }
}
#endif
