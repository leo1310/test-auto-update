package ua.com.bkc;

/**
 * Created by JSC "Bancomzvjazok" on 11/25/16.
 */
public class BPOSLib {
  public BPOSLib() {
    System.out.print(" BPOSLib()\n");
    InitializeBPOS();
  }

  protected void finalize() {
    System.out.print(" BPOSLib::finalize()\n");
    UninitializeBPOS();
  }

  private native int InitializeBPOS();

  private native int UninitializeBPOS();

  public native int CommOpen(String sPort, int iBaudRate);

  public native int CommOpenAuto(int iBaudRate);

  public native int CommOpenTCP(String sIP, String sPort);

  public native int CommClose();

  public native int Confirm();

  public native int Cancel();

  public native int Purchase(int iAmount, int iAddAmount, byte bMerchIdx);

  public native int Refund(int iAmount, int iAddAmount, byte bMerchIdx, String RRN);

  public native int Void(int InvoiceNum, byte MerchIdx);

  public native int Settlement(byte MerchIdx);

  public native int PrintBatchTotals(byte MerchIdx);

  public native int PurchaseService(byte MerchIdx, int Amount, String ServiceParams);

  public native int SetErrorLang(byte ErrorLanguage);

  public native int IdentifyCard(byte MerchIdx, String CurrCode, byte AccNumber);

  public native byte LastResult();

  public native byte LastErrorCode();

  public native int ResponseCode();

  public native String DateTime();

  public native String RRN();

  public native byte TxnType();

  public native String TerminalID();

  public native String MerchantID();

  public native String AuthCode();

  public native String LastErrorDescription();

  public native byte LastStatMsgCode();

  public native String LastStatMsgDescription();

  public native String PAN();

  public native String ExpDate();

  public native String CardHolder();

  public native String IssueName();

  public native int InvoiceNum();

  public native int TotalsDebitAmt();

  public native int TotalsDebitNum();

  public native int TotalsCreditAmt();

  public native int TotalsCreditNum();

  public native int TotalsCancelledAmt();

  public native int TotalsCancelledNum();

  public native byte SignVerif();

  public native String Receipt();

  public native String emvAID();

  public native byte EntryMode();

  public native int TxnNum();

  public native int Amount();

  public native int AddAmount();

  public native byte TermStatus();

  public native byte Key();

  public native String Track3();

  public native byte TrnStatus();

  public native String Currency();

  public native int TrnBatchNum();

  public native String RNK();

  public native String CurrencyCode();

  public native String AddData();

  public native String TerminalInfo();

  public native String DiscountName();

  public native int DiscountAttribute();

  public native String ECRDataTM();

  public native String LibraryVersion();

  public native String ScenarioData();

  public native int GetTxnNum();

  public native int GetTxnDataByOrder(int OrderNum);

  public native int GetTxnDataByInv(int InvoiceNum, byte MerchIdx);

  public native int GetBatchTotals(byte MerchIdx);

  public native int CheckConnection(byte MerchIdx);

  public native int ReqCurrReceipt();

  public native int PrintLastSettleCopy(byte MerchIdx);

  public native int PrintBatchJournal(byte MerchIdx);

  public native int ReqReceiptByInv(int InvoiceNum, byte MerchIdx);

  public native int SetControlMode(boolean isCtrlMode);

  public native int ReadKey(byte TimeOut);

  public native int DisplayText(byte Beep);

  public native int SetLine(byte Row, byte Col, String Text, byte Invert);

  public native int ExchangeStatuses(byte bECRStatus);

  public native int Completion(byte MerchIdx, int Amount, String RRN, int InvoiceNum);

  public native int ReadCard();

  public native int Balance(byte MerchIdx, String CurrCode, byte Accnumber);

  public native int Deposit(byte MerchIdx, int Amount, String CurrCode, byte Accnumber);

  public native int POSGetInfo();

  public native int POSExTransaction();

  public native int SelectApp(String AppName, int AppIdx);

  public native int CloseApp();

  public native int StartScenario(int ScenarioID, String ScenarioData);

  public native int SetExtraPrintData(String ExtraPrintData);

  public native int SetExtraXmlData(String ExtraXmlData);

  public native int useLogging(byte Logginglevel, String FilePath);

  public native int SendFile(String FullPath, byte ECRDataType, byte ECRCommand);

  public native int SetScreen(int ScreenNumber);

  public native int CorrectTransaction(int Amount, int AddAmount);

  public native int CashAdvance(byte MerchIdx, int Amount, String CurrCode, byte AccNumber);

  public native int ReadBankCard();

  public native int FlagAcquirer();

  public native String CryptedData();

  public native String ExtraCardData();

  public native int Ping();

  public native int CheckTerminal();

  static {
    System.load("/usr/lib/libjBPOSLib.so.1.4.17"); // todo: specify here path to library libjBPOSLib.so.1.4.13
  }
}
