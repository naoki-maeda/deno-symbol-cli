import {
  AccountRoutesApi,
  Address,
  assert,
  BigNumber,
  BlockRoutesApi,
  ChainRoutesApi,
  colorize,
  Command,
  Configuration,
  ConfigurationParameters,
  HelpCommand,
  MosaicRoutesApi,
  StringType,
  TransactionGroupEnum,
  TransactionMapping,
  TransactionRoutesApi,
  TransactionStatusRoutesApi,
} from "./deps.ts";

new Command()
  .name("Deno Symbol Cli")
  .version("0.1.0")
  .description("Symbol Cli tool with Deno")
  .default("help")
  .globalOption("-e, --endpoint [endpoint:string]", "Symbol API Endpoint", {
    default: "",
  })
  .globalType("endpoint", new StringType())
  // help
  .command("help", new HelpCommand())
  // tx
  .command("tx <hash:string>", "Get transaction info from hash")
  .option("-s, --status [status:boolean]", "Get transaction status info only", {
    default: false,
  })
  .action(async (option, hash) => await tx(String(option.endpoint), hash, option.status))
  // payload
  .command("payload <payload:string>", "Get decoded transaction from payload")
  .action((_, payloadStr) => payload(payloadStr))
  // account
  .command(
    "account <account:string>",
    "Get account info from address or public key",
  )
  .option(
    "-c, --convert [convert:boolean]",
    "Get converted Mosaics account info",
    {
      default: false,
    },
  )
  .action(async (option, accountStr) => await account(String(option.endpoint), accountStr, option.convert))
  // block
  .command("block <height:string>", "Get block info from block number")
  .action(async (option, height) => await block(String(option.endpoint), height))
  // mosaic
  .command("mosaic <id:string>", "Get mosaic info from mosaic id")
  .action(async (option, id) => await mosaic(String(option.endpoint), id))
  // chain
  .command("chain", "Get current chain info")
  .action(async (option) => await chain(String(option.endpoint)))
  // validate
  .command("validate <address:string>", "Check if valid address")
  .action((_, address) => validate(address))
  .parse(Deno.args);

// Get Symbol API Configuration
const getApiConfig = (endpoint: string) => {
  assert(endpoint.length > 0, "endpoint is required");
  const configurationParameters: ConfigurationParameters = {
    basePath: endpoint,
    fetchApi: fetch,
  };
  return new Configuration(configurationParameters);
};

// print format and colorize
const print = (value: unknown) => {
  console.log(`${colorize(JSON.stringify(value, null, 2))}`);
};

// Command actions
const tx = async (endpoint: string, hash: string, isStatus: boolean) => {
  const apiConfig = getApiConfig(endpoint);
  const statusRoute = new TransactionStatusRoutesApi(apiConfig);
  const txStatus = await statusRoute.getTransactionStatus(hash);
  if (isStatus === true) {
    print(txStatus);
    return;
  }
  const transactionRoute = new TransactionRoutesApi(apiConfig);
  let txDetail;
  switch (txStatus.group) {
    case TransactionGroupEnum.Confirmed:
      txDetail = await transactionRoute.getConfirmedTransaction(hash);
      break;
    case TransactionGroupEnum.Partial:
      txDetail = await transactionRoute.getPartialTransaction(hash);
      break;
    case TransactionGroupEnum.Unconfirmed:
      txDetail = await transactionRoute.getUnconfirmedTransaction(hash);
      break;
    case TransactionGroupEnum.Failed:
      // print tx status
      txDetail = txStatus;
      break;
  }
  print(txDetail);
};

const payload = (payload: string) => {
  const tx = TransactionMapping.createFromPayload(payload);
  print(tx);
};

const account = async (
  endpoint: string,
  account: string,
  isConvert: boolean,
) => {
  const apiConfig = getApiConfig(endpoint);
  const accountRoute = new AccountRoutesApi(apiConfig);
  const accountInfo = await accountRoute.getAccountInfo(account);
  if (isConvert === false) {
    print(accountInfo);
    return;
  }
  // convert mosaic amount
  const mosaicRoute = new MosaicRoutesApi(getApiConfig(endpoint));
  const convertedMosaics = [];
  for (const mosaic of accountInfo.account.mosaics) {
    const mosaicInfo = await mosaicRoute.getMosaic(mosaic.id);
    const divisibility = mosaicInfo.mosaic.divisibility;
    const amount = new BigNumber(mosaic.amount).div(
      Math.pow(10, divisibility),
    );
    const newMosaic = { id: mosaic.id, amount: amount.toString() };
    convertedMosaics.push(newMosaic);
  }
  Object.assign(accountInfo.account.mosaics, convertedMosaics);
  print(accountInfo);
};

const block = async (endpoint: string, height: string) => {
  const blockRoute = new BlockRoutesApi(getApiConfig(endpoint));
  const blockInfo = await blockRoute.getBlockByHeight(height);
  print(blockInfo);
};

const mosaic = async (endpoint: string, id: string) => {
  const mosaicRoute = new MosaicRoutesApi(getApiConfig(endpoint));
  const mosaicInfo = await mosaicRoute.getMosaic(id);
  print(mosaicInfo);
};

const chain = async (endpoint: string) => {
  const chainRoute = new ChainRoutesApi(getApiConfig(endpoint));
  const chainInfo = await chainRoute.getChainInfo();
  print(chainInfo);
};

const validate = (address: string) => {
  const isValidAddress = Address.isValidRawAddress(String(address));
  print({ isValid: isValidAddress });
};
