import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { BsCheckCircleFill } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import { IoIosArrowForward } from "react-icons/io";
import "react-phone-input-2/lib/style.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import styles from "../../Components/Dashboard/SendNFT/sendNft.module.css";
import { LoaderIconBlue } from "../../Components/Generic/icons";
import ImportContactsDialog from "../../Components/ImportContactsDialog/ImportContactsDialog";
import { API_BASE_URL } from "../../Utils/config";

const ContactPopup = ({
  show,
  onClose,
  onBack,
  title,
  btnText,
  handleBtnClick,
  displayImportContact,
}) => {
  let navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedContacts, setSelectedContacts] = useState([]);

  const { user, contacts } = useSelector((state) => state.authReducer);

  const [isLoading, setIsloading] = useState(false);

  const [filteredData, setFilteredData] = useState(contacts);

  useEffect(() => {
    setFilteredData(contacts);
    checkAllContacts(contacts);
  }, [contacts]);

  //get contacts
  useEffect(() => {
    if (!show) return;
    setIsloading(true);

    //Ajax Request to create user
    axios
      .get(`${API_BASE_URL}/contacts/list/${user.user_id}`)
      .then((response) => {
        //save user details
        let tempContacts = response.data.data;
        dispatch({ type: "update_contacts", payload: tempContacts });
      })
      .catch((error) => {
        if (error.response.data) {
          toast.error(error.response.data.message);
        }
      })
      .finally(() => {
        setIsloading(false);
      });
  }, [show]);

  const getPrimaryEmail = (contact) => {
    if (contact.email.length > 0) {
      return contact.email[0].address;
    } else {
      return "";
    }
  };

  const getPrimaryPhone = (contact) => {
    if (contact.phone.length > 0) {
      return contact.phone[0].number;
    } else {
      return "";
    }
  };

  const getFulllName = (contact) => {
    return contact.first_name + " " + contact.last_name;
  };

  const findIfChecked = (contact_id) => {
    return selectedContacts.includes(contact_id);
  };

  const checkAllContacts = (data) => {
    //selecting all the contacts
    setSelectedContacts(data.map((contact) => contact.contact_id));
  };

  const [importContactDialog, setimportContactDialog] =
    useState(displayImportContact);

  const HandleClick = (contact_id) => {
    if (selectedContacts.includes(contact_id)) {
      setSelectedContacts(selectedContacts.filter((cId) => cId !== contact_id));
    } else {
      setSelectedContacts([...selectedContacts, contact_id]);
    }
  };

  const importContact = (data) => {
    if (data) {
      checkAllContacts(data);
      setimportContactDialog(false);
      setFilteredData(data);
    }
  };

  const contactImportCallback = (error, source) => {
    setimportContactDialog(false);

    if (error) {
      if (source === "backdropClick") {
        toast.error(`Please select a contact provider to import contacts`);
        return;
      }
      toast.error(`Something Went Wrong Fetching Contacts From ${source}`);
      return;
    } else {
      toast.success(`Your Contacts Were Successfully Imported From ${source}`);
      return;
    }
  };

  const handleSearch = (event) => {
    let value = event.target.value.toLowerCase();
    let result = [];
    result = contacts.filter((data) => {
      return (
        getFulllName(data).toLowerCase().search(value) !== -1 ||
        getPrimaryEmail(data).toLowerCase().search(value) !== -1 ||
        getPrimaryPhone(data).toLowerCase().search(value) !== -1
      );
    });
    setFilteredData(result);
  };

  return (
    <>
      <Modal
        className={`${styles.initial__nft__modal} send__nft__mobile__modal initial__modal`}
        show={show}
        onHide={onClose}
        backdrop="static"
        size="lg"
        centered
        keyboard={false}
      >
        <Modal.Header className={styles.modal__header__wrapper} closeButton>
          <div className="modal__multiple__wrapper">
            <button onClick={onBack} className="back__btn">
              Back
            </button>
            <Modal.Title>
              <div className={styles.modal__header}>
                <h2>{title}</h2>
              </div>
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div
            className={`${styles.modal__body__wrapper} ${styles.modal__contact__list}`}
          >
            <div className={styles.search__wrapper}>
              <div className={styles.search__inner__wrapper}>
                <div className={styles.search__input}>
                  <div className={styles.searchIcon}>
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search People"
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setimportContactDialog(true);
                }}
              >
                Import
              </button>
            </div>
            <div className={styles.data__wrapper}>
              <div>{isLoading && <LoaderIconBlue />}</div>

              {filteredData.map((contact, index) => (
                <div className={styles.data_row_container} key={nanoid()}>
                  {/* TEXT */}
                  <div className={styles.textContainer}>
                    <h6>{getFulllName(contact)}</h6>
                    <p>{getPrimaryEmail(contact)}</p>
                  </div>
                  {/* ICONS */}
                  <div
                    className={styles.icon}
                    onClick={() => HandleClick(contact.contact_id)}
                  >
                    {findIfChecked(contact.contact_id) ? (
                      <BsCheckCircleFill className={styles.checked} />
                    ) : (
                      <GoPrimitiveDot className={styles.unchecked} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.multiple__btn__wrapper}>
            <button
              disabled={selectedContacts.length === 0 ? true : false}
              onClick={() => {
                handleBtnClick(selectedContacts);
              }}
              className={styles.next__btn}
            >
              {btnText}
              <span>
                <IoIosArrowForward />
              </span>
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {importContactDialog ? (
        <ImportContactsDialog
          onImport={importContact}
          status={importContactDialog}
          callback={contactImportCallback}
        />
      ) : null}
    </>
  );
};
export default ContactPopup;
