import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import Transloadit from "@uppy/transloadit";
import { useEffect, useRef, useState } from "react";

const UploadModalButton = ({sendMessage, activeChannel}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const uppy = useRef();

  useEffect(() => {
    uppy.current = new Uppy()
      .use(Transloadit, {
        waitForEncoding: true,
        assemblyOptions: {
          params: {
            auth: { key: 'af6150c906df44059f41869c9ddaf762' },
            template_id: '931a799d3d6e40a9beb4b7f1417cd1b1',
          },
        },
      })

   uppy.current.on('transloadit:result', (stepName, result, assembly) => { 
    const url = result.ssl_url;
    sendMessage(url, activeChannel, "image")
    handleClose();
   });
  }, [activeChannel, sendMessage])

  const handleOpen = () => {
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
  }


  return (
    <div>
      <button onClick={handleOpen}>Select Image</button>
      { uppy.current ? (<DashboardModal
        uppy={uppy.current}
        closeModalOnClickOutside
        open={modalOpen}
        onRequestClose={handleClose}
      />) : null}
      
    </div>
  );
}

export default  UploadModalButton;