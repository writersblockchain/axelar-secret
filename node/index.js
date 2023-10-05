import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync("../axelar-secret/contract.wasm.gz");

// let codeId = 1524;
// let contractCodeHash =
//   "c125bcf327cb6605a1503b254678f62f618f33d56c0dfcffee3bda642ab22b34";
// let contractAddress = "secret1snxynfg7x8new3a7p30tn5e44s3q34eue3ahnv";
// let contractCodeHash =
//   "c125bcf327cb6605a1503b254678f62f618f33d56c0dfcffee3bda642ab22b34";
// let contractAddress = "secret1k2rz6eugrxnkvpnkvhlkaldcxe0z838vzfhyvq";

const secretjs = new SecretNetworkClient({
  chainId: "secret-4",
  url: "https://lcd.mainnet.secretsaturn.net",
  wallet: wallet,
  walletAddress: wallet.address,
});

let upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  const codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );
  // console.log(tx);
  console.log("codeId: ", codeId);

  const contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;
  console.log(`Contract hash: ${contractCodeHash}`);
};

// upload_contract();

let instantiate_contract = async () => {
  // Create an instance of the Counter contract, providing a starting count
  const initMsg = {};
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "send_receive " + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log(contractAddress);
};

// instantiate_contract();

let send_message_evm = async () => {
  const tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        send_message_evm: {
          destination_chain: "Polygon",
          destination_address: "0x2f5414aFCac277B6FCe859Aa1454937F38D86C2c",
          message:
            "One small secret step for human, one large secret step for humankind",
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(tx);
};

// send_message_evm();

let queryContractInfo = async () => {
  let query = await secretjs.query.compute.contractInfo({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
  });

  console.log(query);
};
// queryContractInfo();

let get_stored_message = async () => {
  let query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    query: {
      get_stored_message: {},
    },
    code_hash: contractCodeHash,
  });

  console.log(query);
};

get_stored_message();

// secretcli tx wasm execute secret1snxynfg7x8new3a7p30tn5e44s3q34eue3ahnv '{"send_message_evm": {"destination_chain": "Polygon", "destination_address":"0x2f5414aFCac277B6FCe859Aa1454937F38D86C2c","message":"seanrad"}}' --amount 1uscrt --from pulsar3-test
