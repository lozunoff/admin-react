import axios from 'axios';

export default class EditorImages {
    constructor(element, virtualElement, ...[isLoading, isLoaded, showNotifications]) {
        this.element = element;
        this.virtualElement = virtualElement;

        this.element.addEventListener('click', () => this.onClick());
        this.imgUploader = document.querySelector("#img-upload");

        this.isLoading = isLoading;
        this.isLoaded = isLoaded;
        this.showNotifications = showNotifications;
    }

    onClick() {
        this.imgUploader.click();

        const changeHandler = () => {
            if (this.imgUploader.files && this.imgUploader.files[0]) {
                let formData = new FormData();
                formData.append("image", this.imgUploader.files[0]);

                this.isLoading();
                axios
                    .post('./api/uploadImage.php', formData, {
                        headers: {
                            "Content-Type": "muptipart/form-data",
                        }
                    })
                    .then((res) => {
                        this.virtualElement.src = this.element.src = `./img/${res.data.src}`;
                    })
                    .catch(() => this.showNotifications('Ошибка сохранения', 'danger'))
                    .finally(() => {
                        this.imgUploader.removeEventListener('change', changeHandler);
                        this.imgUploader.value = '';
                        this.isLoaded();
                    });
            }
        }

        this.imgUploader.addEventListener('change', changeHandler);
    }
}
