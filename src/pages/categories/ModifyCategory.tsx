import React from 'react'
import ReactDOM from 'react-dom';
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const ModifyCategory = ({ isOpen, onClose, title }: ModalProps) => {
  if (!isOpen) return null;


  return ReactDOM.createPortal(
    <div className='fixed inset-0 z-[1000] flex justify-center'>
      {/* Background Overlay */}
      <div
        className='absolute inset-0 bg-black opacity-40'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className='relative z-[1001] bg-white py-4  shadow-md w-[90%] h-3/6  my-7 max-w-lg font-nunito rounded-2xl'>
        
       <div className='my-3 border-b border-neutral-300 px-4'>
         <h1 className='text-3xl font-semibold py-2  '>{title}</h1>
       </div>
        <form className='flex flex-col m-2 py-3  px-4 gap-10'>
            <div className='flex gap-2 flex-col '>
                <label className='' htmlFor='category-name'>Nom de la categorie</label>
                <input type='text' className='border p-2 rounded-2xl' />
            </div>
          <div className='flex justify-center gap-9 text-lg'>
              <button className='border p-3  rounded-2xl bg-cyan-900 hover:bg-cyan-800 cursor-pointer text-white '>sauvegarder</button>
              <button className=' p-2 text-red-500 cursor-pointer hover:border hover:rounded' onClick={onClose}>Annuler</button>
        </div>
        </form>
        
      </div>
    </div>,
    document.body
  );
}

export default ModifyCategory
