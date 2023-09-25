import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync(
  "../axelar-secret/target/wasm32-unknown-unknown/release/secret_axelar.wasm"
);

// let codeId = 934;
// let contractCodeHash =
//   "a448595e3a46197776ff966c980d0de770c052c7f1ced1577027906835126bd5";
// let contractAddress = "secret1xjvnf8fru5xe2x73g6mdfef9zcj00umhvvzqsp";

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://api.pulsar3.scrttestnet.com",
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

  console.log(tx);
};

// const codeId = Number(
//   tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
//     .value
// );
// // console.log(tx);
// console.log("codeId: ", codeId);

//   const contractCodeHash = (
//     await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
//   ).code_hash;
//   console.log(`Contract hash: ${contractCodeHash}`);
// };

upload_contract();

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
